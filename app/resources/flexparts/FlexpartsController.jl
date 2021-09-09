module FlexpartsController
using Genie.Renderer.Html, Genie.Requests
using ViewHelper
using FlexFiles
using JSON
using Dates
using ReadNcf
using GeoJSON
using GeoInterface
using Flexpart

const PYTHON_PATH = "/opt/anaconda3/bin/python"
# const FLEX_EXTRACT_PATH = "/home/tcarion/flexpart/flex_extract_app"
const FLEX_EXTRACT_PATH = "/home/tcarion/flexpart/flex_extract_v7.1.2"
const FLEX_EXTRACT_CONTROL = "CONTROL_OD.OPER.FC.eta.highres.app"
const FLEX_EXTRACT_RUN_PATH = joinpath(FLEX_EXTRACT_PATH, "Run")
const FLEX_EXTRACT_SOURCE_PYTHON_PATH = joinpath(FLEX_EXTRACT_PATH, "Source", "Python")
const FLEX_EXTRACT_CONTROL_PATH = joinpath(FLEX_EXTRACT_RUN_PATH, "Control", FLEX_EXTRACT_CONTROL)
const FLEX_EXTRACT_EXEC_PATH = joinpath(FLEX_EXTRACT_RUN_PATH, "run_local.sh")
const FLEX_EXTRACT_SUBMIT_PATH = joinpath(FLEX_EXTRACT_SOURCE_PYTHON_PATH, "submit.py")

const EXTRACTED_MET_DATA_DIR = joinpath(pwd(), "public", "extracted_met_data")
const CONTROL_FILE_NAME = "CONTROL_OD.OPER.FC.eta.highres.app"

FLEXPART_RUN_TEMPLATE_PATH = "/home/tcarion/flexpart/flexpart_run_template_tests"

const JsonPayload = Dict{Symbol, Any}
const Output = JsonPayload
const Result = JsonPayload

FLEXPART_RUNS_DIR = joinpath(pwd(), "public", "flexpart_runs")

global pl = 0

function round_area(area)
    return [ceil(area[1]), floor(area[2]), floor(area[3]), ceil(area[4])]
end

function run_flexextract(output_path, params, ws_info)
    cmd = `$PYTHON_PATH $FLEX_EXTRACT_SUBMIT_PATH $params`
    # cmd = `test/sleeping_script.sh`
    log_file = open(joinpath(output_path, "output_log.log"), "w")
    println("START RUNNING $(cmd)")
    process = open(cmd)
    while !eof(process)
        line = readline(process, keep=true)
        to_send = Dict(:displayed => line, :backid => ws_info["backid"])
        Genie.WebChannels.broadcast(ws_info["channel"], "flexpart", to_send)
        write(log_file, line) 
        flush(log_file)
    end

    if process.exitcode == 1
        throw(ProcessFailedException(process))
    end
    close(process)
    close(log_file)
end

function run_flexpart(run_dir_path, ws_info)
    cur_dir = pwd()
    try
        cd(run_dir_path)
        cmd = `FLEXPART`
        log_file = open(joinpath(run_dir_path, "output.log"), "w")
        process = open(cmd)
        cd(cur_dir)
        while !eof(process)
            line = readline(process, keep=true)
            to_send = Dict(:displayed => line, :backid => ws_info["backid"])
            Genie.WebChannels.broadcast(ws_info["channel"], "flexpart", to_send)
            write(log_file, line)
            flush(log_file)
        end

        if process.exitcode == 1
            throw(ProcessFailedException(process))
        end

        close(process)
        close(log_file)
    catch e
        throw(e)
    finally
        cd(cur_dir)
    end
end

function flexextract_request(payload)
    global pl = payload

    startdate = Dates.DateTime(payload["startDate"][1:22])
    enddate = Dates.DateTime(payload["endDate"][1:22])
    timestep = payload["timeStep"]
    gridres = payload["gridRes"]
    area = payload["area"]
    area = round_area(area)

    area_str = join(convert.(Int, area .|> round), "_")

    dir_name = Dates.format(startdate, "yyyymmdd_HHMM") * "_" * area_str
    dir_path = joinpath(EXTRACTED_MET_DATA_DIR, dir_name)
    mkpath(dir_path)
    inputdir = joinpath(dir_path, "input")
    outputdir = joinpath(dir_path, "output")
    mkpath(inputdir)
    mkpath(outputdir)

    # options = Dict(
    #     :startdate => startdate,
    #     :enddate => enddate,
    #     :timestep => timestep,
    #     :gridres => gridres,
    #     :area => area,
    # )
    # @show options
    # formated_options =  FlexFiles.flexextract_options(options)

    # ctrl_file_path = FlexFiles.update_flexfile(FLEX_EXTRACT_CONTROL_PATH, formated_options, "controlfile", dest=dir_path)

    fcontrol = FlexControl(FLEX_EXTRACT_CONTROL_PATH)
    fcontrol[:GRID] = gridres
    set_area!(fcontrol, area)
    set_steps!(fcontrol, startdate, enddate, timestep)
    ctrl_file_path = write(fcontrol, dir_path)

    formated_exec = Dict("inputdir" => inputdir, "outputdir" => outputdir, "controlfile" => ctrl_file_path)
    params = []
    for (k, v) in formated_exec 
        push!(params, "--$k") 
        push!(params, v)
    end
    
    # run_flexextract(dir_path, params, request_data["ws_info"])
end

function available_flexpart_input(payload)
    metdata_dir = readdir(EXTRACTED_MET_DATA_DIR, join=true)
    control_files = joinpath.(metdata_dir, CONTROL_FILE_NAME)
    metadata = FlexFiles.flexextract_metadata.(control_files)
    # metadata = metadata[(!).(isnothing.(metadata))]
    dirnames = map(x -> splitpath(x)[end], metdata_dir)
    
    response = Dict[]
    for (index, md) in enumerate(metadata)
        if !isnothing(md) 
            push!(md, :dataDirname => dirnames[index])
            push!(response, md)
        end
    end
    # response = [push!(x, :dataDirname => dir) for (x, dir) in zip(metadata, dirnames)]
    return response
end

function flexpart_run(payload)
    request_data = payload
    global pl = payload
    startdate = Dates.DateTime(request_data["startDate"][1:22])
    enddate = Dates.DateTime(request_data["endDate"][1:22])
    releasestartdate = Dates.DateTime(request_data["releaseStartDate"][1:22])
    releaseenddate = Dates.DateTime(request_data["releaseEndDate"][1:22])
    releaseheight = request_data["releaseHeight"]
    timestep = request_data["timeStep"]
    gridres = request_data["gridRes"]
    area = request_data["area"]
    area = area isa Dict ? area : Base.copy(area) 
    rel_lon = request_data["lon"]
    rel_lat = request_data["lat"]
    particules = request_data["particulesNumber"]
    metdata_dirname = request_data["dataDirname"]
    mass = request_data["mass"]

    run_dir_name = Dates.format(startdate, dateformat"yyyymmdd_HH")*"_"*Dates.format(enddate, dateformat"yyyymmdd_HH")*"_"*particules
    run_dir_path = joinpath(pwd(), "public", "flexpart_runs", run_dir_name)
    mkpath(run_dir_path)
    cp(FLEXPART_RUN_TEMPLATE_PATH, run_dir_path, force=true)

    options_dir_path = joinpath(run_dir_path, "options")

    options = FlexpartOptions(FLEXPART_RUN_TEMPLATE_PATH)

    command_options = Dict(
        :ibdate => Dates.format(startdate, "yyyymmdd"),
        :ibtime => Dates.format(startdate, "HHMMSS"),
        :iedate => Dates.format(enddate, "yyyymmdd"),
        :ietime => Dates.format(enddate, "HHMMSS"),
         )
    Flexpart.set(options["COMMAND"][:command], command_options)

    releases_options = Dict(
        :idate1 => Dates.format(releasestartdate, "yyyymmdd"),
        :itime1 => Dates.format(releasestartdate, "HHMMSS"),
        :idate2 => Dates.format(releaseenddate, "yyyymmdd"),
        :itime2 => Dates.format(releaseenddate, "HHMMSS"),
        :lon1 => rel_lon,
        :lon2 => rel_lon,
        :lat1 => rel_lat,
        :lat2 => rel_lat,
        :z1 => releaseheight,
        :z2 => releaseheight,
        :parts => particules,
        :mass => mass
    )
    Flexpart.set(options["RELEASES"][:release], releases_options)

    Flexpart.set(options["OUTGRID"][:outgrid], area2outgrid(area, gridres))

    write(options, run_dir_path)

    # FlexFiles.update_flexfile(joinpath(options_dir_path, "COMMAND"), command_options, "namelist")
    # FlexFiles.update_flexfile(joinpath(options_dir_path, "RELEASES"), releases_options, "namelist")
    # FlexFiles.update_flexfile(joinpath(options_dir_path, "OUTGRID"), outgrid_options, "namelist")

    metdata_dirname = joinpath(pwd(), "public", "extracted_met_data", metdata_dirname, "output/")

    pathnames_path = joinpath(pwd(), run_dir_path, "pathnames")
    pathnames = readlines(pathnames_path)
    pathnames[3] = metdata_dirname
    open(pathnames_path, "w") do f
        for l in pathnames write(f, l*"\n") end
    end

    FlexFiles.update_available(joinpath(pwd(), run_dir_path, "AVAILABLE"), metdata_dirname)

    run_flexpart(run_dir_path, request_data["ws_info"])

end


"""
    flexpart_options(payload)
Return options for a flexpart run

Input payload:
    "dataDirname" :: String
Output:
    Dict(
        :RELEASES => release file to dict,
        :COMMAND => command file to dict,
        :OUTGRID => outgrid file to dict,
    )
"""
function flexpart_options(payload)
    dirname = payload["dirname"]
    options_dir = joinpath(pwd(), "public", "flexpart_runs", dirname, "options")

    Dict(
        :RELEASES => namelist2dict(joinpath(options_dir, "RELEASES")),
        :COMMAND => namelist2dict(joinpath(options_dir, "COMMAND")),
        :OUTGRID => namelist2dict(joinpath(options_dir, "OUTGRID")),
    )
end

"""
    flexpart_results()
Return all flexpart runs with principal metadata

Input payload:
    none
Output:
    Dict(
        :startDate :: Date,
        :endDate :: Date
        :times :: Int[],
        :heights :: Real[],
        :area :: Real[],
        :dataDirname :: String,
    )[]
"""
function flexpart_results(payload)
    available_fp_runs_dir = filter(x -> isdir(x), readdir(FLEXPART_RUNS_DIR, join=true))
    available_fp_runs = Array{Dict, 1}()
    for dir in available_fp_runs_dir
        output_dir = joinpath(dir, "output")
        ncf_file = filter(x->occursin(".nc",x), readdir(output_dir))
        isempty(ncf_file) && break
        ncf_file = ncf_file[1]
        metadata = ReadNcf.ncfmetadata(joinpath(output_dir, ncf_file))
        push!(metadata, :dataDirname => splitpath(dir)[end])
        push!(available_fp_runs, metadata)
    end
    return available_fp_runs
end

"""
    get_results()
Return all flexpart runs

Output:
    Dict(
        :id :: String,
        :output :: Output
    )[]
"""
function get_results()
    available_fp_runs_dir = filter(x -> isdir(x), readdir(FLEXPART_RUNS_DIR, join=true))
    function f(x)
        id = basename(x)
        ncfs = try
            ncf_files(x)
        catch
            return Dict(:id => id, :outputs => nothing)
        end
        isempty(ncfs) && return Dict(:id => id, :outputs => nothing)
        return Dict(
            :id => id,
            :outputs => [output2dict(x) for x in ncfs]
        )
    end
    map(f, available_fp_runs_dir)
end

function output2dict(outpath)
    output = FlexpartOutput(outpath)
    lons, lats = output.lons, output.lats
    dx, dy = deltamesh(lons, lats)
    v2d = variables2d(output)
    d = Dict(
        :id => basename(outpath),
        :times => output.metadata.times,
        :startDate => output.metadata.startd,
        :endDate => output.metadata.endd,
        :dx => dx,
        :dy => dy,
        :releaseLons => output.metadata.rellons,
        :releaseLats => output.metadata.rellats,
        :area => areamesh(lons, lats),
        :globAttr => attrib(output),
        :variables => keys(output.ncdataset),
        :variables2d => Dict(
            Symbol(v) => Flexpart.alldims(output.ncdataset, output.ncdataset[v])
         for v in v2d),
    ) 
    close(output)
    d
end
"""
    flexpart_conc()
Return meta data for a flexpart run

Input payload:
    Dict(
        :timeStep :: Int,
        :heights :: Int
        :dataDirname :: String,
    )[]
Output:
    Dict(
        :lons :: Real[],
        :lats :: Real[],
        :values :: Real[],
    )[]
"""
# function flexpart_conc(payload)
#     sent_data = payload
#     run_name = sent_data["dataDirname"]
#     time = sent_data["timeSteps"]

#     available_fp_runs = filter(x -> isdir(x), readdir(FLEXPART_RUNS_DIR, join=true))
#     available_fp_runs = [splitpath(x)[end] for x in available_fp_runs]

#     if !(run_name in available_fp_runs)
#         throw(Genie.Exceptions.RuntimeException("Flexpart run not found", "The flexpart output hasn't been found on the server", 1))
#     end
    
#     output_dir = Flexpart
#     ncf_file = filter(x->occursin(".nc",x), readdir(output_dir))[1]
#     ncf_file = joinpath(output_dir, ncf_file)
#     lon, lat, conc = ReadNcf.get_filtered_field(ncf_file, time)

#     response = Dict("lons" => lon, "lats" => lat, "values" => log10.(conc))
#     return response
# end

function flexpart_geojson_conc(payload)
    global pl = payload
    @show payload["dimensions"]
    received = payload
    var = received["variable"]
    dims = received["dimensions"]
    dims =  dims isa Dict ? received["dimensions"] : Base.copy(received["dimensions"]) # convert to Dict in case of JSON3.Object
    run_name = received["dataDirname"]


    available_fp_runs = filter(x -> isdir(x), readdir(FLEXPART_RUNS_DIR, join=true))
    available_fp_runs = [splitpath(x)[end] for x in available_fp_runs]

    if !(run_name in available_fp_runs)
        throw(Genie.Exceptions.RuntimeException("Flexpart run not found", "The flexpart output hasn't been found on the server", 1))
    end
    
    # output_dir = joinpath(pwd(), "public", "flexpart_runs", run_name, "output")
    # ncf_file = filter(x->occursin(".nc",x), readdir(output_dir))[1]
    path = get_fpdir(run_name)
    ncf_file = ncf_files(get_fpdir(run_name); onlynested=false)[1]

    # lons, lats = Flexpart.mesh(ncf_file)
    # dx, dy = Flexpart.deltamesh(lons, lats)
    # dataset = conc_diskarray(ncf_file)
    output = FlexpartOutput(ncf_file)
    Flexpart.select!(output, var)
    Flexpart.select!(output, dims)

    # iheight = findall(x -> isapprox(x, height), Flexpart.heights(ncf_file))[1]
    
    # conc = dataset[:, :, iheight, time, 1, 1]
    lons = output.lons
    lats = output.lats
    dataset = output.dataset
    close(output)
    flons, flats, fconc = Flexpart.filter_fields(lons, lats, dataset)
    isempty(fconc) && return Genie.Router.error(1, "The requested field is empty", "application/json")
    dx, dy = deltamesh(lons, lats)

    framed = ReadNcf.fields2cells(flons, flats, fconc, dx, dy)
    # cells, legend_data = ReadNcf.frame2geojson(ncf_file, time, flexpart_result["dx"], flexpart_result["dy"])
    cells, legend_data = ReadNcf.frame2geojson(framed)

    rellons, rellats = Flexpart.relloc(ncf_file)
    relpoints = [Feature(Point([lon, lat]), Dict("type" => "releasePoint")) for (lon, lat) in zip(rellons, rellats)]
    push!(cells, FeatureCollection(relpoints))

    fp_run_data = ReadNcf.ncfmetadata(ncf_file)
    Dict(
        # "flexpartResult" => fp_run_data,
        "cells" => [cell |> geo2dict for cell in cells],
        "legendData" => legend_data
    )
end

function flexpart_daily_average(payload)
    run_name = payload["dataDirname"]
    path = get_fpdir(run_name)
    ncf_file = ncf_files(path; onlynested=false)[3]
    output = FlexpartOutput(ncf_file)
    Flexpart.select!(output, "spec001_mr")
    Flexpart.select!(output, (time=:, height=1, pointspec=1, nageclass=1))
    Flexpart.write_daily_average!(output, copy=false)
    close(output)
    "Daily average"
end

function get_fpdir(run_name)
    joinpath(FLEXPART_RUNS_DIR, run_name)
end

end
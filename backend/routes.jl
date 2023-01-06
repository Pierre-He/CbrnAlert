using Genie.Router, Genie.Requests, Genie.Assets
using SearchLight
# using ATPController
# using FlexpartController
using CbrnAlertApp.AuthenticationController
using CbrnAlertApp.Atp45Controller
using CbrnAlertApp.FlexpartController
using CbrnAlertApp.FlexpartInputsController
using CbrnAlertApp.FlexpartRunsController
using CbrnAlertApp.FlexpartOutputsController
using JSONWebTokens
using StructTypes
using UUIDs
using YAML

using SwagUI

using SearchLight
using CbrnAlertApp.Users

using CbrnAlertApp: API_DOC_FILE

global DEBUG_PAYLOAD = 0
global DEBUG_PARAMS = 0
global DEBUG_REQUEST = 0

# Genie.config.websockets_server = true
# for user in SearchLight.all(User)
#     Genie.Assets.channels_subscribe(user.email)
# end

route("/api/login", AuthenticationController.login, method = POST)

api_routes = Dict(
    "/forecast/available" => (f=Atp45Controller.available_steps, keyargs=(method=GET,)),
    "/atp45/tree" => (f=Atp45Controller.get_tree, keyargs=(method=GET,)),
    "/atp45/run" => (f=Atp45Controller.post_run, keyargs=(method=POST,)),
    "/atp45/containers" => (f=Atp45Controller.get_container, keyargs=(method=GET,)),
    "/atp45/procedures" => (f=Atp45Controller.get_procedure, keyargs=(method=GET,)),
    "/atp45/incidents" => (f=Atp45Controller.get_incident, keyargs=(method=GET,)),
    "/atp45/run/wind" => (f=Atp45Controller.run_wind, keyargs=(method=POST,)),
    "/atp45/run/forecast" => (f=Atp45Controller.run_forecast, keyargs=(method=POST,)),
    # "/flexpart/meteo_data_request" => (f=FlexpartController.meteo_data_request, keyargs=(method=POST, named=:meteo_data_request)),
    "/flexpart/input" => (f=FlexpartInputsController.data_retrieval, keyargs=(method=POST,)),
    "/flexpart/inputs" => (f=FlexpartInputsController.get_inputs, keyargs=(method=GET,)),
    "/flexpart/run" => (f=FlexpartRunsController.run, keyargs=(method=POST,)),
    "/flexpart/runs" => (f=FlexpartRunsController.get_runs, keyargs=(method = GET,)),
    "/flexpart/runs/:runId::String" => (f=FlexpartRunsController.get_run, keyargs=(method = GET,)),
    "/flexpart/runs/:runId::String/outputs" => (f=FlexpartOutputsController.get_outputs, keyargs=(method = GET,)),
    "/flexpart/outputs/:outputId::String" => (f=FlexpartOutputsController.get_output, keyargs=(method = GET,)),
    "/flexpart/outputs/:outputId::String/layers/" => (f=FlexpartOutputsController.get_layers, keyargs=(method = GET,)),
    "/flexpart/outputs/:outputId::String/dimensions/" => (f=FlexpartOutputsController.get_dimensions, keyargs=(method = GET,)),
    "/flexpart/outputs/:outputId::String/slice/" => (f=FlexpartOutputsController.get_slice, keyargs=(method = POST,)),
)

for (url, args) in api_routes
    route("/api"*url; args[:keyargs]...) do
        if ENV["GENIE_ENV"] !== "prod"
            global DEBUG_PAYLOAD = Genie.Requests.jsonpayload()
            global DEBUG_PARAMS = Genie.Router.params()
            global DEBUG_REQUEST = Genie.Router.request()
        end
        # would be better to do that in Genie.Router.pre_match_hooks. See GenieAuthentication which provides an example (basicauthparams)
        # if ENV["GENIE_ENV"] !== "dev"
            Users.@authenticated!
        # end
        args[:f]()
    end
end

route("/docs") do 
    swagger_document = YAML.load_file(API_DOC_FILE; dicttype=Dict{String, Any})
    render_swagger(swagger_document)
end
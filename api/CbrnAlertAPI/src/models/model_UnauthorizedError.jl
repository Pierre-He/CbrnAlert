# This file was generated by the Julia OpenAPI Code Generator
# Do not modify this file directly. Modify the OpenAPI specification instead.


@doc raw"""
    UnauthorizedError(;
        error=nothing,
        info=nothing,
    )

    - error::String
    - info::String
"""
Base.@kwdef mutable struct UnauthorizedError <: OpenAPI.APIModel
    error::Union{Nothing, String} = nothing
    info::Union{Nothing, String} = nothing

    function UnauthorizedError(error, info, )
        OpenAPI.validate_property(UnauthorizedError, Symbol("error"), error)
        OpenAPI.validate_property(UnauthorizedError, Symbol("info"), info)
        return new(error, info, )
    end
end # type UnauthorizedError

const _property_types_UnauthorizedError = Dict{Symbol,String}(Symbol("error")=>"String", Symbol("info")=>"String", )
OpenAPI.property_type(::Type{ UnauthorizedError }, name::Symbol) = Union{Nothing,eval(Base.Meta.parse(_property_types_UnauthorizedError[name]))}

function check_required(o::UnauthorizedError)
    o.error === nothing && (return false)
    true
end

function OpenAPI.validate_property(::Type{ UnauthorizedError }, name::Symbol, val)
end
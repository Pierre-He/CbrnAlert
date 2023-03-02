# This file was generated by the Julia OpenAPI Code Generator
# Do not modify this file directly. Modify the OpenAPI specification instead.


@doc raw"""
    User(;
        email=nothing,
        username=nothing,
        name=nothing,
    )

    - email::String
    - username::String
    - name::String
"""
Base.@kwdef mutable struct User <: OpenAPI.APIModel
    email::Union{Nothing, String} = nothing
    username::Union{Nothing, String} = nothing
    name::Union{Nothing, String} = nothing

    function User(email, username, name, )
        OpenAPI.validate_property(User, Symbol("email"), email)
        OpenAPI.validate_property(User, Symbol("username"), username)
        OpenAPI.validate_property(User, Symbol("name"), name)
        return new(email, username, name, )
    end
end # type User

const _property_types_User = Dict{Symbol,String}(Symbol("email")=>"String", Symbol("username")=>"String", Symbol("name")=>"String", )
OpenAPI.property_type(::Type{ User }, name::Symbol) = Union{Nothing,eval(Base.Meta.parse(_property_types_User[name]))}

function check_required(o::User)
    o.email === nothing && (return false)
    o.username === nothing && (return false)
    true
end

function OpenAPI.validate_property(::Type{ User }, name::Symbol, val)
end
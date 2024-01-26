#!/bin/bash

cd frontend
dos2unix setup.sh 
npm install @angular/cli
npm install
npm run generate:all

cd ../backend
yum install dos2unix
dos2unix ./bin/repl

export PYTHON=""
julia +1.7 --project -e 'using Pkg; Pkg.instantiate()'
julia +1.7 --project setup.jl


openssl genrsa -out config/private.pem 2048
openssl rsa -in config/private.pem -out config/public.pem -outform PEM -pubout

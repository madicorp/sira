#!/bin/sh

function build_image {
  cat Dockerfile.tmplt | DJANGO_SETTINGS_MODULE="sira.settings.$1" envsubst > Dockerfile && docker build -t ekougs/sira:$2 . && rm Dockerfile
}

function unset_machine {
    unset DOCKER_TLS_VERIFY
    unset DOCKER_HOST
    unset DOCKER_MACHINE_NAME
    unset DOCKER_CERT_PATH
}
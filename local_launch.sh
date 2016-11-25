#!/usr/bin/env bash

pip install --upgrade pip && pip install -r requirements.txt
./docker/sira/docker-entrypoint.sh

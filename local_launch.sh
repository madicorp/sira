#!/usr/bin/env bash

pip install --upgrade pip && pip install -r requirements.txt
# TODO if i18n
# python ./manage.py compilemessages -l fr
./docker/sira/launch.sh
#!/bin/bash

BASEDIR=$(dirname "$0")
if [ -z ${POSTGRES_1_PORT_5432_TCP_ADDR+x} ]; then
python manage.py makemigrations && python manage.py migrate --noinput && python manage.py loaddata sira\
 && python manage.py update_index && python manage.py runserver 0.0.0.0:8000
else
$BASEDIR/wait-for-it.sh "$POSTGRES_1_PORT_5432_TCP_ADDR:$POSTGRES_1_PORT_5432_TCP_PORT" && \
$BASEDIR/wait-for-it.sh -t 240 "$SIRA_ELASTICSEARCH_1_PORT_9200_TCP_ADDR:$SIRA_ELASTICSEARCH_1_PORT_9200_TCP_PORT" && \
python manage.py makemigrations && python manage.py migrate --noinput && python manage.py loaddata sira\
 && python manage.py update_index && gunicorn sira.wsgi --bind 0.0.0.0:8000
fi
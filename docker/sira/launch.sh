#!/bin/bash

python manage.py migrate --noinput && python manage.py loaddata sira && \
python manage.py update_index && python manage.py runserver 0.0.0.0:8000
from __future__ import absolute_import, unicode_literals

from .base import *

DEBUG = True

SECRET_KEY = os.getenv('SECRET_KEY')
ALLOWED_HOSTS = ['sira.gouv.sn']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.getenv('POSTGRES_USER'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': 'postgres',
        'PORT': 5432
    }
}

ELASTICSEARCH_URL = 'http://elasticsearch:9200'

WAGTAILSEARCH_BACKENDS = {
    'default': {
        'BACKEND': 'wagtail.wagtailsearch.backends.elasticsearch2',
        'URLS': [ELASTICSEARCH_URL],
        'AUTO_UPDATE': True,
        'INDEX': 'wagtail',
        'TIMEOUT': 5,
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

COMPRESS_ENABLED = True
COMPRESS_OFFLINE = True

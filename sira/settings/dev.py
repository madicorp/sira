from __future__ import absolute_import, unicode_literals

from .base import *

DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '3ysrfps@vh1b1#g@k@rw6(%s=jv9%4ghp=8it_ydj&g6gn_268'
# AVOID IN PROD SETTINGS
ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.getenv('POSTGRES_USER'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('POSTGRES_1_PORT_5432_TCP_ADDR'),
        'PORT': os.getenv('POSTGRES_1_PORT_5432_TCP_PORT')
    }
}

ELASTICSEARCH_URL = 'http://' + os.getenv('SIRA_ELASTICSEARCH_1_PORT_9200_TCP_ADDR', '') + ':' + \
                    os.getenv('SIRA_ELASTICSEARCH_1_PORT_9200_TCP_PORT', '')

WAGTAILSEARCH_BACKENDS = {
    'default': {
        'BACKEND': 'wagtail.wagtailsearch.backends.elasticsearch',
        'URLS': [ELASTICSEARCH_URL],
        'AUTO_UPDATE': True,
        'INDEX': 'wagtail',
        'TIMEOUT': 5,
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

COMPRESS_ENABLED = True
COMPRESS_OFFLINE = True

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

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s|%(asctime)s|%(module)s|%(process)d|%(thread)d|%(message)s',
            'datefmt': "%d/%b/%Y %H:%M:%S"
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'formatter': 'verbose',
            'filename': os.path.join('/var/log/sira', 'sira.log'),
            'when': 'midnight',
            'backupCount': 15,
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'sira': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'wagtail': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'puput': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'wagtailmedia': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

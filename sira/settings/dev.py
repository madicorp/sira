from __future__ import absolute_import, unicode_literals

from .base import *

DEBUG = False

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

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

COMPRESS_ENABLED = True
COMPRESS_OFFLINE = True

try:
    from .local import *
except ImportError:
    pass

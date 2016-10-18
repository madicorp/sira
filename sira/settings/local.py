from __future__ import absolute_import, unicode_literals

from .base import *

DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '3ysrfps@vh1b1#g@k@rw6(%s=jv9%4ghp=8it_ydj&g6gn_268'

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

WAGTAILSEARCH_BACKENDS = {
    'default': {
        'BACKEND': 'wagtail.wagtailsearch.backends.elasticsearch',
        'URLS': ['tcp://localhost:9200'],
        'INDEX': 'wagtail',
        'TIMEOUT': 5,
    }
}

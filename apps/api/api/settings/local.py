"""
Local development settings.
"""

from .base import *  # noqa: F401,F403

DEBUG = True

ALLOWED_HOSTS = ['*']

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'

# Database - use SQLite for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Celery - use in-memory broker if Redis is not available
CELERY_TASK_ALWAYS_EAGER = True
CELERY_BROKER_URL = 'memory://'
CELERY_RESULT_BACKEND = 'cache+memory://'

# Email backend for local development (console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

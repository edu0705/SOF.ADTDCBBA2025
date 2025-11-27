from .base import *

# MODO PRODUCCIÓN: SEGURO
DEBUG = False

ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['midominio.com', 'localhost'])

# Base de Datos PostgreSQL (OBLIGATORIO EN PROD)
DATABASES = {
    'default': env.db('DATABASE_URL')
}

# CORS Restrictivo
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['https://midominio.com'])
CORS_ALLOW_CREDENTIALS = True

# Seguridad HTTP
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Channels con Redis (Producción)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(env('REDIS_HOST'), 6379)],
        },
    },
}

print("🛡️ CARGADA CONFIGURACIÓN: PRODUCCIÓN")
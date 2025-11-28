from .base import *

# MODO PRODUCCIÓN: Siempre False
DEBUG = False

# Host permitidos (leídos de .env)
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['midominio.com', 'localhost'])

# Base de Datos PostgreSQL
DATABASES = {
    'default': env.db('DATABASE_URL')
}

# --- SEGURIDAD HTTP (SSL/HTTPS) ---
# IMPORTANTE: Descomenta las siguientes 3 líneas SOLO cuando tengas un dominio real (https://...)
# y certificado SSL instalado. Si las activas en localhost, el login fallará.

# SECURE_SSL_REDIRECT = True
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True

# Estos filtros sí se pueden dejar activos siempre
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# --- CORS & CSRF ---
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['https://midominio.com'])
CORS_ALLOW_CREDENTIALS = True

# ¡CRÍTICO PARA NGINX!
# Django necesita saber que confía en el dominio que le envía la petición a través del proxy.
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=['https://midominio.com'])

# Channels con Redis
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(env('REDIS_HOST'), 6379)],
        },
    },
}

print("🛡️ CARGADA CONFIGURACIÓN: PRODUCCIÓN (Docker Ready)")
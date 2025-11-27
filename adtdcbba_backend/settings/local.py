from .base import *
import sys

# MODO DESARROLLO
DEBUG = True

ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True

# --- BASE DE DATOS ---
# Forzamos la conexión al puerto externo de Docker (5433)
# Esto es vital para evitar conflictos con Postgres local en 5432
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'adtdcbba_db',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost', # O '127.0.0.1'
        'PORT': '5433',      # <--- PUERTO EXTERNO DE DOCKER
    }
}

# --- CHANNELS (WebSockets) ---
# Apuntamos al puerto externo de Redis en Docker (6380)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6380)], # <--- PUERTO EXTERNO DE DOCKER
        },
    },
}

print("🔧 CARGADA CONFIGURACIÓN: LOCAL (DOCKER PORTS 5433/6380)")
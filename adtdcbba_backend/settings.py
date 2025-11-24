import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- 1. SEGURIDAD ---
# Lee del .env o usa valores por defecto inseguros (SOLO para local)
SECRET_KEY = config('SECRET_KEY', default='django-insecure-clave-local-super-secreta')
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# Application definition
INSTALLED_APPS = [
    'daphne', # <--- IMPORTANTE: Debe ir primero para WebSockets (ASGI)
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Terceros
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'channels', 
    'drf_spectacular', # Documentación API
    
    # Mis Apps
    'users',
    'clubs',
    'deportistas',
    'competencias',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Servir estáticos optimizados
    'corsheaders.middleware.CorsMiddleware', # CORS (Conexión con React)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'adtdcbba_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'adtdcbba_backend.wsgi.application'
ASGI_APPLICATION = 'adtdcbba_backend.asgi.application'


# --- 2. BASE DE DATOS HÍBRIDA ---
# Si existe DATABASE_URL (Render/Nube), usa Postgres.
# Si NO existe (Tu PC), crea automáticamente un archivo db.sqlite3
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600
    )
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]


# Internationalization
LANGUAGE_CODE = 'es-bo'
TIME_ZONE = 'America/La_Paz'
USE_I18N = True
USE_TZ = True


# --- ARCHIVOS ESTÁTICOS Y MEDIA ---
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Usamos Whitenoise para servir estáticos. 
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --- 3. CONFIGURACIÓN CORS (React) ---
# ¡IMPORTANTE!: Permitir credenciales para que las cookies viajen
CORS_ALLOW_CREDENTIALS = True 

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",      # React Legacy
    "http://127.0.0.1:3000",
    "http://localhost:5173",      # Vite (Frontend Moderno)
    "http://127.0.0.1:5173",
]

# Si defines una URL de producción en el .env, la agrega automáticamente
if config('CORS_ALLOWED_ORIGIN_PROD', default=None):
    CORS_ALLOWED_ORIGINS.append(config('CORS_ALLOWED_ORIGIN_PROD'))

CORS_ALLOW_ALL_ORIGINS = False # Seguridad: Solo permitir orígenes listados

# --- SEGURIDAD DE COOKIES (NUEVO - JWT EN HTTPONLY) ---
AUTH_COOKIE = 'access'
AUTH_COOKIE_REFRESH = 'refresh'

# En Producción (False en local si no tienes HTTPS, True en Producción con SSL)
AUTH_COOKIE_SECURE = config('AUTH_COOKIE_SECURE', default=not DEBUG, cast=bool)
AUTH_COOKIE_HTTP_ONLY = True     # JavaScript no puede leerlas (Protección XSS)
AUTH_COOKIE_PATH = '/'
AUTH_COOKIE_SAMESITE = 'Lax'     # Lax es seguro para navegación estándar

# --- REST FRAMEWORK & SWAGGER ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # Usamos nuestra clase personalizada para leer la cookie
        'users.authentication.CustomJWTAuthentication', 
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'API de Tiro Deportivo',
    'DESCRIPTION': 'Sistema de gestión de competencias y puntajes en tiempo real',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# --- JWT (Tokens) ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
}

# --- 4. WEBSOCKETS HÍBRIDOS (Channels) ---
if config('REDIS_URL', default=None):
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [config('REDIS_URL')],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        }
    }
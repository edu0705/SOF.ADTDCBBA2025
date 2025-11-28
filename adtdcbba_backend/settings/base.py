from pathlib import Path
import os
from datetime import timedelta
import environ

# Inicializar variables de entorno
env = environ.Env()

# Intentar leer .env solo si existe (útil para desarrollo local fuera de Docker)
# En Docker, las variables vienen del docker-compose, así que esto es un fallback.
BASE_DIR = Path(__file__).resolve().parent.parent.parent
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# --- SEGURIDAD CRÍTICA ---
# Si falta esta variable, la app NO debe iniciar. Sin defaults inseguros.
SECRET_KEY = env('DJANGO_SECRET_KEY')

# Debug debe ser False por defecto a menos que se especifique lo contrario
DEBUG = env.bool('DEBUG', default=False)

ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# Aplicaciones instaladas
DJANGO_APPS = [
    'daphne', # Daphne debe ir al principio para ASGI
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders', 
    'channels',
    'drf_spectacular', 
]

LOCAL_APPS = [
    'users',
    'competencias',
    'deportistas',
    'clubs',
    # 'adtdcbba_backend', # No es necesario agregar la carpeta de configuración como app
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware', 
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
ASGI_APPLICATION = "adtdcbba_backend.asgi.application"

# --- BASE DE DATOS ---
# Usamos dj-database-url (que viene con django-environ)
DATABASES = {
    'default': env.db('DATABASE_URL', default=f'sqlite:///{BASE_DIR / "db.sqlite3"}')
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'es-bo'
TIME_ZONE = 'America/La_Paz'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# --- REST FRAMEWORK CONFIG ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # 'rest_framework_simplejwt.authentication.JWTAuthentication', 
        # COMENTADO: Usamos nuestra autenticación personalizada que lee cookies
        'users.authentication.CustomJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# --- JWT CONFIG ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# --- COOKIE AUTH SETTINGS ---
# Estas configuraciones controlan cómo se guardan las cookies
AUTH_COOKIE = 'access_token'
AUTH_COOKIE_REFRESH = 'refresh_token'
AUTH_COOKIE_SECURE = env.bool('AUTH_COOKIE_SECURE', default=False) # True en Prod (HTTPS)
AUTH_COOKIE_HTTP_ONLY = True
AUTH_COOKIE_PATH = '/'
AUTH_COOKIE_SAMESITE = 'Lax' # 'Lax' es necesario para que funcione la navegación normal

# --- CHANNELS (REDIS) ---
if env('REDIS_HOST', default=None):
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [(env('REDIS_HOST'), 6379)],
            },
        },
    }
else:
    # Fallback a memoria para desarrollo sin docker (aunque no recomendado para WS)
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        }
    }

# --- CORS & CSRF ---
# Permitimos credenciales (Cookies)
CORS_ALLOW_CREDENTIALS = True

# Definimos orígenes permitidos desde variables de entorno
# Ejemplo en .env: CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=["http://localhost", "http://127.0.0.1"])

# CSRF Trusted Origins (Obligatorio para Django 4.0+ tras proxy)
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=["http://localhost", "http://127.0.0.1"])

# Configuración de validación CSRF
CSRF_COOKIE_NAME = 'csrftoken'
CSRF_HEADER_NAME = 'HTTP_X_CSRFTOKEN'
CSRF_COOKIE_HTTPONLY = False # Debe ser False para que JS (Axios) pueda leerla y enviarla en el header
CSRF_USE_SESSIONS = False
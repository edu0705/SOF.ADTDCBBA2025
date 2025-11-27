import os
import django

# 1. Configurar settings ANTES de importar channels
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adtdcbba_backend.settings.prod')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import competencias.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                competencias.routing.websocket_urlpatterns
            )
        )
    ),
})
# adtdcbba_backend/asgi.py
import os
from channels.routing import ProtocolTypeRouter, URLRouter # Asegúrate de que URLRouter esté aquí
from django.core.asgi import get_asgi_application
from adtdcbba_backend.routing import websocket_urlpatterns # Importa el enrutador de WebSockets

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adtdcbba_backend.settings')

# Esta es la configuración crucial:
application = ProtocolTypeRouter({
  "http": get_asgi_application(),
  "websocket": URLRouter(websocket_urlpatterns),
})
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Ruta: ws://host/ws/competencia/123/
    re_path(r'ws/competencia/(?P<competencia_id>\w+)/$', consumers.CompetenciaConsumer.as_asgi()),
]
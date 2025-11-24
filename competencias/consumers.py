import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import Group

class ResultadoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 1. Autenticación Robusta (Gracias al Middleware de Cookies)
        if self.scope['user'].is_anonymous:
            await self.close()
            return

        self.competencia_id = self.scope['url_route']['kwargs']['competencia_id']
        self.competencia_group_name = f'competencia_{self.competencia_id}'

        # Unirse al grupo
        await self.channel_layer.group_add(
            self.competencia_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.competencia_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Maneja los mensajes entrantes.
        SEGURIDAD: Solo Jueces y Staff pueden transmitir actualizaciones.
        """
        text_data_json = json.loads(text_data)
        user = self.scope['user']

        # 2. Verificación de Permisos (Anti-Hack)
        # Consultamos a la BD si el usuario tiene permiso para actualizar puntajes
        is_authorized = await self.verificar_permisos_juez(user)

        if not is_authorized:
            # Si un usuario normal intenta enviar datos, le enviamos error y no hacemos broadcast
            await self.send(text_data=json.dumps({
                'error': 'Permiso denegado. Solo Jueces pueden actualizar puntajes.'
            }))
            return

        # 3. Si es Juez, retransmitimos a todos
        await self.channel_layer.group_send(
            self.competencia_group_name,
            {
                'type': 'resultado_update',
                'data': text_data_json
            }
        )

    async def resultado_update(self, event):
        # Enviar datos al cliente final
        await self.send(text_data=json.dumps(event['data']))

    # --- Helpers Auxiliares ---
    @database_sync_to_async
    def verificar_permisos_juez(self, user):
        """Revisa si el usuario es Staff o pertenece al grupo 'Juez'"""
        if user.is_staff:
            return True
        return user.groups.filter(name='Juez').exists()
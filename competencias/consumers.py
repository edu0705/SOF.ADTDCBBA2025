import json
from channels.generic.websocket import AsyncWebsocketConsumer

class CompetenciaConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Obtenemos el ID de la competencia desde la URL
        self.competencia_id = self.scope['url_route']['kwargs']['competencia_id']
        self.room_group_name = f"competencia_{self.competencia_id}"

        # Unirse al grupo de la sala
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"🔌 WebSocket Conectado: {self.room_group_name}")

    async def disconnect(self, close_code):
        # Salirse del grupo de la sala
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"🔌 WebSocket Desconectado: {self.room_group_name}")

    # Este método recibe el mensaje desde services.py
    async def update_score(self, event):
        data = event['data']

        # Enviar mensaje al WebSocket (Frontend)
        await self.send(text_data=json.dumps({
            'type': 'score_update',
            'payload': data
        }))
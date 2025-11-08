# clubs/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Club # <--- Asegúrate de que esta importación exista
from .serializers import ClubSerializer

class ClubViewSet(viewsets.ModelViewSet):
    # Solución: Definir el queryset que el router necesita
    queryset = Club.objects.all() 

    serializer_class = ClubSerializer
    permission_classes = [IsAuthenticated]

    # Sobreescribimos get_queryset para el filtro (como ya lo hicimos)
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Club.objects.all()
        # Devuelve solo el club asociado al usuario logueado
        return Club.objects.filter(user=user)
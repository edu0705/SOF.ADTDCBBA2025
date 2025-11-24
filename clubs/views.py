from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Club
from .serializers import ClubSerializer

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    # Protegemos la vista para que solo usuarios logueados puedan ver/editar
    permission_classes = [IsAuthenticated]
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Deportista, Arma, DocumentoDeportista, PrestamoArma
# CORRECCIÓN: Importamos los nombres exactos que definimos en serializers.py
from .serializers import (
    DeportistaSerializer, 
    ArmaSerializer, 
    DocumentoDeportistaSerializer, # <--- Nombre corregido
    PrestamoArmaSerializer
)

class DeportistaViewSet(viewsets.ModelViewSet):
    queryset = Deportista.objects.all()
    serializer_class = DeportistaSerializer
    permission_classes = [IsAuthenticated]

class ArmaViewSet(viewsets.ModelViewSet):
    queryset = Arma.objects.all()
    serializer_class = ArmaSerializer
    permission_classes = [IsAuthenticated]

class DocumentoDeportistaViewSet(viewsets.ModelViewSet):
    queryset = DocumentoDeportista.objects.all()
    serializer_class = DocumentoDeportistaSerializer
    permission_classes = [IsAuthenticated]

class PrestamoArmaViewSet(viewsets.ModelViewSet):
    queryset = PrestamoArma.objects.all()
    serializer_class = PrestamoArmaSerializer
    permission_classes = [IsAuthenticated]
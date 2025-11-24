# deportistas/serializers.py
from rest_framework import serializers
from .models import Deportista, DocumentoDeportista, Arma, PrestamoArma
from clubs.models import Club

# --- SERIALIZADORES AUXILIARES ---

class DocumentoModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoDeportista
        fields = '__all__'

class ArmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Arma
        fields = '__all__'

class PrestamoArmaSerializer(serializers.ModelSerializer):
    arma_info = serializers.CharField(source='arma.marca', read_only=True)
    propietario_nombre = serializers.CharField(source='deportista_propietario.first_name', read_only=True)
    receptor_nombre = serializers.CharField(source='deportista_receptor.first_name', read_only=True)
    
    class Meta:
        model = PrestamoArma
        fields = '__all__'

# --- SERIALIZADOR PRINCIPAL ---

class DeportistaSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.name', read_only=True)
    # Mostramos documentos y armas anidados para facilitar la vista de perfil
    documentos = DocumentoModelSerializer(many=True, read_only=True)
    armas = ArmaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Deportista
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'user']
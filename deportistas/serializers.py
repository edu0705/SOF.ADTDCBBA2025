from rest_framework import serializers
from .models import Deportista, Arma, DocumentoDeportista, PrestamoArma

class ArmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Arma
        fields = '__all__'

class DocumentoDeportistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoDeportista
        fields = '__all__'

class DeportistaSerializer(serializers.ModelSerializer):
    club_nombre = serializers.CharField(source='club.name', read_only=True)
    armas = ArmaSerializer(many=True, read_only=True)
    documentos = DocumentoDeportistaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Deportista
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at', 'updated_at')

class PrestamoArmaSerializer(serializers.ModelSerializer):
    arma_detalle = serializers.CharField(source='arma.__str__', read_only=True)
    propietario_nombre = serializers.CharField(source='deportista_propietario.__str__', read_only=True)
    receptor_nombre = serializers.CharField(source='deportista_receptor.__str__', read_only=True)

    class Meta:
        model = PrestamoArma
        fields = '__all__'
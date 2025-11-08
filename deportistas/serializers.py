from rest_framework import serializers
from .models import Deportista, Documento, Arma
from clubs.models import Club
from django.contrib.auth.models import User
# import json # Solo si lo necesitas para parsing, mejor no incluir si no se usa

# --- Serializadores de Documentos y Armas (Anidados) ---
class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        # Incluye 'id' para evitar warnings de React si lo tienes en el frontend
        fields = ['id', 'document_type', 'expiration_date', 'file_path'] 

class ArmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Arma
        # Incluye 'id' para evitar warnings de React si lo tienes en el frontend
        fields = ['id', 'tipo', 'calibre', 'marca', 'modelo', 'numero_matricula', 'fecha_inspeccion', 'file_path']

# --- 1. Serializador Genérico (Para Listado y Detalle) ---
class DeportistaSerializer(serializers.ModelSerializer):
    # CRUCIAL: Definir las relaciones anidadas para que se incluyan en la respuesta GET (detalle)
    documentos = DocumentoSerializer(many=True, read_only=True)
    armas = ArmaSerializer(many=True, read_only=True)
    
    # Muestra el nombre del Club en lugar del ID
    club_info = serializers.CharField(source='club.name', read_only=True) 
    
    # Campo de solo lectura para el email del usuario (útil para el detalle)
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Deportista
        # fields = '__all__' es la opción más sencilla y segura.
        fields = '__all__'

# --- 2. Serializador de Registro (Para POST) ---
class DeportistaRegistrationSerializer(serializers.ModelSerializer):
    # Los documentos y armas vienen como strings JSON en el POST de registro
    documentos = serializers.CharField(write_only=True) 
    armas = serializers.CharField(write_only=True)
    foto_path = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = Deportista
        # Incluimos solo los campos que se llenan en el formulario de registro.
        fields = [
            'first_name', 'last_name', 'ci', 'birth_date', 'departamento',
            'genero', 'telefono', 'foto_path', 'documentos', 'armas'
        ]
        # Campos que el usuario NO puede modificar en el registro (solo el sistema/admin)
        read_only_fields = ['status', 'club', 'user', 'notas_admin'] 

    # NOTA: La lógica para crear Documentos y Armas desde los strings JSON 
    # DEBE estar implementada en la función create() de este serializador.
    def create(self, validated_data):
        # ... (Tu lógica de creación debe manejar validated_data['documentos'] y validated_data['armas'])
        # Ejemplo:
        # documentos_data = json.loads(validated_data.pop('documentos'))
        
        # ... El resto de tu lógica de creación ...
        
        return super().create(validated_data)
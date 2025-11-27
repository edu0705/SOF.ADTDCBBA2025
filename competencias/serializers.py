from rest_framework import serializers
from django.db import transaction
from .models import (
    Competencia, Modalidad, Categoria, Poligono, Juez, 
    Inscripcion, Resultado, Gasto, CategoriaCompetencia, Participacion
)

# --- SERIALIZADORES AUXILIARES ---

class PoligonoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poligono
        fields = '__all__'

class ModalidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modalidad
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    modalidad_nombre = serializers.ReadOnlyField(source='modalidad.name')
    class Meta:
        model = Categoria
        fields = '__all__'

class JuezSerializer(serializers.ModelSerializer):
    class Meta:
        model = Juez
        fields = '__all__'

class GastoSerializer(serializers.ModelSerializer):
    registrado_por_nombre = serializers.ReadOnlyField(source='registrado_por.username')
    class Meta:
        model = Gasto
        fields = '__all__'
        read_only_fields = ('registrado_por',)

# --- SERIALIZADOR ESPECIAL PARA EL FRONTEND (COSTOS) ---
class CategoriaCompetenciaInfoSerializer(serializers.ModelSerializer):
    """
    Devuelve la categoría con su costo específico para una competencia.
    Usado en el formulario de inscripción.
    """
    id = serializers.ReadOnlyField(source='categoria.id')
    name = serializers.ReadOnlyField(source='categoria.name')
    modalidad_nombre = serializers.ReadOnlyField(source='categoria.modalidad.name')
    
    class Meta:
        model = CategoriaCompetencia
        fields = ['id', 'name', 'modalidad_nombre', 'costo']

# --- SERIALIZADORES PRINCIPALES ---

class CompetenciaSerializer(serializers.ModelSerializer):
    poligono_nombre = serializers.ReadOnlyField(source='poligono.name')
    
    class Meta:
        model = Competencia
        fields = '__all__'

class ParticipacionSerializer(serializers.ModelSerializer):
    modalidad_nombre = serializers.ReadOnlyField(source='modalidad.name')
    categoria_nombre = serializers.ReadOnlyField(source='categoria.name')
    
    class Meta:
        model = Participacion
        fields = '__all__'

class InscripcionSerializer(serializers.ModelSerializer):
    deportista_nombre = serializers.ReadOnlyField(source='deportista.__str__')
    club_nombre = serializers.ReadOnlyField(source='club.name')
    competencia_nombre = serializers.ReadOnlyField(source='competencia.name')
    participaciones = ParticipacionSerializer(many=True, read_only=True)

    class Meta:
        model = Inscripcion
        fields = '__all__'

class ParticipacionCreateInputSerializer(serializers.Serializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())

class InscripcionCreateSerializer(serializers.ModelSerializer):
    participaciones = ParticipacionCreateInputSerializer(many=True, write_only=True)

    class Meta:
        model = Inscripcion
        fields = '__all__'
    
    def create(self, validated_data):
        participaciones_data = validated_data.pop('participaciones', [])
        
        with transaction.atomic():
            inscripcion = Inscripcion.objects.create(**validated_data)
            
            for item in participaciones_data:
                categoria = item['categoria']
                # Buscamos el costo configurado para esta competencia
                try:
                    cat_comp = CategoriaCompetencia.objects.get(
                        competencia=inscripcion.competencia,
                        categoria=categoria
                    )
                    costo = cat_comp.costo
                except CategoriaCompetencia.DoesNotExist:
                    costo = 0 
                
                # Creamos la participación
                Participacion.objects.create(
                    inscripcion=inscripcion,
                    categoria=categoria,
                    modalidad=categoria.modalidad,
                    costo_cobrado=costo
                )
            
            # Recalcular totales con las reglas de negocio (Techo máximo)
            inscripcion.actualizar_total()
            
        return inscripcion

class ResultadoSerializer(serializers.ModelSerializer):
    deportista = serializers.ReadOnlyField(source='inscripcion.deportista.__str__')
    club = serializers.ReadOnlyField(source='inscripcion.club.name')
    competencia = serializers.ReadOnlyField(source='inscripcion.competencia.name')
    series = serializers.JSONField(source='detalles_json', read_only=True) # Mapeo de lectura

    class Meta:
        model = Resultado
        fields = '__all__'

class ScoreSubmissionSerializer(serializers.ModelSerializer):
    series = serializers.ListField(child=serializers.DictField(), write_only=True)
    
    class Meta:
        model = Resultado
        fields = ['inscripcion', 'ronda_o_serie', 'series', 'juez_que_registro']
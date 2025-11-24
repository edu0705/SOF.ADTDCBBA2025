# competencias/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import date
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import (
    Competencia, Modalidad, Categoria, Poligono, Juez, 
    Inscripcion, Resultado, Participacion, Record, CategoriaCompetencia, Gasto
)
from deportistas.models import Deportista, Arma, PrestamoArma
from clubs.models import Club
from .score_utils import calculate_round_score

# --- NUEVO: Importamos el Servicio de Reglas de Negocio ---
from deportistas.services import GestionDeportistaService


# --- SERIALIZADORES BASE ---

class PoligonoSerializer(serializers.ModelSerializer):
    class Meta: model = Poligono; fields = '__all__'

class JuezSerializer(serializers.ModelSerializer):
    class Meta: model = Juez; fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta: model = Categoria; fields = '__all__'

class ModalidadSerializer(serializers.ModelSerializer):
    categorias = CategoriaSerializer(many=True, read_only=True)
    class Meta: model = Modalidad; fields = ['id', 'name', 'categorias']

class GastoSerializer(serializers.ModelSerializer):
    class Meta: model = Gasto; fields = '__all__'

class CategoriaCompetenciaSerializer(serializers.ModelSerializer):
    categoria_id = serializers.ReadOnlyField(source='categoria.id')
    categoria_name = serializers.ReadOnlyField(source='categoria.name')
    modalidad_name = serializers.ReadOnlyField(source='categoria.modalidad.name')
    modalidad_id = serializers.ReadOnlyField(source='categoria.modalidad.id')
    # EXPORTAMOS CALIBRE PARA FRONTEND
    calibre_permitido = serializers.ReadOnlyField(source='categoria.calibre_permitido')
    class Meta:
        model = CategoriaCompetencia
        fields = ['id', 'categoria_id', 'categoria_name', 'modalidad_id', 'modalidad_name', 'costo', 'calibre_permitido']

class CompetenciaSerializer(serializers.ModelSerializer):
    lista_precios = CategoriaCompetenciaSerializer(source='categoriacompetencia_set', many=True, read_only=True)
    precios_input = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    categorias = serializers.PrimaryKeyRelatedField(many=True, queryset=Categoria.objects.all(), required=False)
    jueces = serializers.PrimaryKeyRelatedField(many=True, queryset=Juez.objects.all(), required=False)
    
    class Meta: model = Competencia; fields = '__all__'
    
    def create(self, validated_data):
        precios = validated_data.pop('precios_input', [])
        cats = validated_data.pop('categorias', [])
        jueces = validated_data.pop('jueces', [])
        
        comp = Competencia.objects.create(**validated_data)
        comp.jueces.set(jueces)
        
        for cat in cats:
            p = next((x for x in precios if int(x['id'])==cat.id), None)
            CategoriaCompetencia.objects.create(competencia=comp, categoria=cat, costo=p['costo'] if p else 0)
        return comp

class ParticipacionSerializer(serializers.ModelSerializer):
    modalidad_name = serializers.CharField(source='modalidad.name', read_only=True)
    categoria_name = serializers.CharField(source='categoria.name', read_only=True)
    arma_info = serializers.CharField(source='arma_utilizada.marca', read_only=True)
    arma_calibre = serializers.CharField(source='arma_utilizada.calibre', read_only=True)
    class Meta: model = Participacion; fields = '__all__'

class ParticipacionCreateSerializer(serializers.ModelSerializer):
    categoria_id = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all(), source='categoria')
    class Meta: model = Participacion; fields = ['categoria_id', 'arma_utilizada']

class InscripcionSerializer(serializers.ModelSerializer):
    participaciones = ParticipacionSerializer(many=True, read_only=True) 
    deportista_nombre = serializers.CharField(source='deportista.first_name', read_only=True)
    deportista_apellido = serializers.CharField(source='deportista.apellido_paterno', read_only=True)
    club_nombre = serializers.CharField(source='club.name', read_only=True)
    competencia_nombre = serializers.CharField(source='competencia.name', read_only=True)
    class Meta: model = Inscripcion; fields = '__all__'


# --- SERIALIZADOR PRINCIPAL DE REGISTRO (CON VALIDACIONES) ---

class InscripcionCreateSerializer(serializers.ModelSerializer):
    participaciones = ParticipacionCreateSerializer(many=True, write_only=True)
    class Meta: 
        model = Inscripcion
        fields = ['deportista', 'competencia', 'participaciones'] 

    def validate(self, data):
        competencia = data.get('competencia')
        participaciones = data.get('participaciones', [])
        deportista = data.get('deportista')
        
        # --- 1. REGLAS DE NEGOCIO (Nuevo Servicio) ---
        # Validamos si está suspendido, dado de baja o inactivo.
        try:
            GestionDeportistaService.validar_para_competencia(deportista)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"deportista": str(e)})

        # --- 2. REGLAS TÉCNICAS (Armas y Licencias) ---
        today = date.today()
        # Calculamos la edad real (manejo robusto si no tiene fecha exacta, aunque es obligatorio)
        edad = deportista.get_edad() if hasattr(deportista, 'get_edad') else 18 

        # Estado de Licencia (Solo para fuego)
        licencia_b = deportista.documentos.filter(document_type='Licencia B').order_by('-expiration_date').first()
        tiene_licencia = licencia_b and (not licencia_b.expiration_date or licencia_b.expiration_date >= today)

        for part in participaciones:
            arma = part.get('arma_utilizada')
            cat_obj = part.get('categoria')

            if arma:
                # A. FILTRO CALIBRE
                if cat_obj.calibre_permitido and arma.calibre.lower().strip() != cat_obj.calibre_permitido.lower().strip():
                     raise serializers.ValidationError(
                         f"La categoría '{cat_obj.name}' exige calibre {cat_obj.calibre_permitido}, pero el arma seleccionada es {arma.calibre}."
                     )

                # B. REGLAS ARMA FUEGO (No Aire)
                if not arma.es_aire_comprimido:
                    # Menor de edad
                    if edad < 21:
                        if not deportista.archivo_responsabilidad:
                            raise serializers.ValidationError(f"El deportista es menor ({edad} años) y requiere 'Carta de Responsabilidad de Tutor' para usar fuego.")
                    else:
                        # Mayor sin licencia
                        if not tiene_licencia:
                            raise serializers.ValidationError(f"Mayor de edad sin Licencia B vigente. Solo puede inscribirse en Aire Comprimido.")

                    # Inspección Técnica (Obligatoria desde 2026)
                    if competencia.start_date.year >= 2026:
                        if not arma.fecha_inspeccion or arma.fecha_inspeccion < competencia.start_date:
                            raise serializers.ValidationError(f"El arma {arma.marca} tiene la inspección técnica vencida.")

                # C. PROPIEDAD DEL ARMA
                if arma.deportista != deportista:
                    # Si no es suya, debe existir un préstamo registrado para esta competencia
                    if not PrestamoArma.objects.filter(arma=arma, deportista_receptor=deportista, competencia=competencia).exists():
                        raise serializers.ValidationError(f"El arma {arma.marca} no pertenece al deportista ni existe un registro de préstamo válido para esta competencia.")

            # D. ARMA OBLIGATORIA (Regla futura 2026)
            elif competencia.start_date.year >= 2026:
                 raise serializers.ValidationError("A partir de la gestión 2026 es obligatorio declarar el arma en la inscripción.")
        
        return data

    @transaction.atomic
    def create(self, validated_data):
        participaciones_data = validated_data.pop('participaciones')
        competencia = validated_data['competencia']
        deportista = validated_data['deportista']
        
        # --- HISTORIAL DE CLUB ---
        # Asignamos el club que tiene el deportista EN ESTE MOMENTO.
        # Esto congela el historial: si cambia de club mañana, esta inscripción queda con el club de hoy.
        club_actual = deportista.club
        
        # Calculamos costo
        total_a_pagar = competencia.costo_inscripcion_base
        
        # Creamos o recuperamos la inscripción
        inscripcion, created = Inscripcion.objects.get_or_create(
            competencia=competencia, 
            deportista=deportista,
            defaults={
                'club': club_actual, 
                'costo_inscripcion': 0,
                'estado': 'PENDIENTE'
            }
        )
        
        if not created: 
            total_a_pagar = inscripcion.costo_inscripcion

        # Procesamos las categorías (Participaciones)
        for p_data in participaciones_data:
            cat_obj = p_data['categoria']
            
            # Evitamos duplicados
            if Participacion.objects.filter(inscripcion=inscripcion, categoria=cat_obj).exists(): 
                continue
            
            # Buscamos el costo específico de esta categoría en esta competencia
            try: 
                costo_cat = CategoriaCompetencia.objects.get(competencia=competencia, categoria=cat_obj).costo
            except CategoriaCompetencia.DoesNotExist: 
                costo_cat = 0
            
            total_a_pagar += costo_cat

            Participacion.objects.create(
                inscripcion=inscripcion, 
                categoria=cat_obj, 
                modalidad=cat_obj.modalidad,
                arma_utilizada=p_data.get('arma_utilizada'), 
                costo_cobrado=costo_cat
            )
        
        # Actualizamos el total final
        inscripcion.costo_inscripcion = total_a_pagar
        inscripcion.save()
        
        return inscripcion


# --- SCORE & RESULTADOS ---

class ResultadoSerializer(serializers.ModelSerializer):
    class Meta: model = Resultado; fields = '__all__'

class ScoreSubmissionSerializer(serializers.ModelSerializer):
    inscripcion = serializers.PrimaryKeyRelatedField(queryset=Inscripcion.objects.all())
    puntaje_crudo = serializers.JSONField(write_only=True) 
    ronda_o_serie = serializers.CharField(max_length=50) 
    
    class Meta: model = Resultado; fields = ['inscripcion', 'ronda_o_serie', 'puntaje_crudo'] 
    
    def validate(self, data):
        if data.get('inscripcion').competencia.status == 'Finalizada': 
            raise serializers.ValidationError("La competencia está cerrada, no se pueden subir más puntajes.")
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        juez = None
        
        # Intentamos identificar al Juez que envía
        if request and hasattr(request, 'user') and not request.user.is_anonymous:
            try: juez = request.user.juez_profile
            except: pass 
        
        inscripcion = validated_data.get('inscripcion')
        score_data = validated_data.pop('puntaje_crudo')
        ronda = validated_data.get('ronda_o_serie')
        
        # Asumimos que la ronda define la modalidad/participación implícitamente o tomamos la primera activa
        participacion = inscripcion.participaciones.first() 
        if not participacion: 
            raise serializers.ValidationError("El deportista no tiene participaciones registradas.")
             
        # Cálculo del puntaje final usando la utilidad de scoring
        final_score = calculate_round_score(participacion.modalidad.name, score_data)
        
        resultado = Resultado.objects.create(
            inscripcion=inscripcion, 
            puntaje=final_score, 
            detalles_json=score_data,
            ronda_o_serie=ronda, 
            juez_que_registro=juez
        )
        
        # --- LÓGICA DE RÉCORDS AUTOMÁTICOS ---
        comp = inscripcion.competencia
        cats = comp.categorias.filter(modalidad=participacion.modalidad)
        
        for cat in cats:
            # Buscamos récord vigente
            rec_actual = Record.objects.filter(modalidad=participacion.modalidad, categoria=cat, es_actual=True).first()
            es_nuevo_record = False
            
            if rec_actual:
                if final_score > rec_actual.puntaje:
                    rec_actual.es_actual = False
                    rec_actual.save()
                    es_nuevo_record = True
            else:
                es_nuevo_record = True
                
            if es_nuevo_record:
                Record.objects.create(
                    modalidad=participacion.modalidad, 
                    categoria=cat, 
                    deportista=inscripcion.deportista,
                    competencia=comp, 
                    puntaje=final_score, 
                    fecha_registro=comp.start_date, 
                    es_actual=True, 
                    antecesor=rec_actual
                )
        
        # --- REAL-TIME: WEBSOCKETS ---
        cl = get_channel_layer()
        dep_name = f"{inscripcion.deportista.first_name} {inscripcion.deportista.apellido_paterno}"
        arma = f"{participacion.arma_utilizada.marca}" if participacion.arma_utilizada else "N/A"
        
        async_to_sync(cl.group_send)(
            f'competencia_{comp.id}',
            {
                'type': 'resultado_update', 
                'data': {
                    'inscripcion_id': inscripcion.id, 
                    'puntaje': str(final_score), 
                    'deportista': dep_name, 
                    'arma': arma
                }
            }
        )
        return resultado
# competencias/views.py
from django.http import HttpResponse
from django.db.models import Sum
from datetime import date

# DRF
from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

# Modelos
from .models import (
    Competencia, Modalidad, Categoria, Poligono, Juez, 
    Inscripcion, Resultado, Record, Gasto
)

# Serializadores
from .serializers import (
    CompetenciaSerializer, ModalidadSerializer, CategoriaSerializer, 
    PoligonoSerializer, JuezSerializer, InscripcionSerializer, 
    InscripcionCreateSerializer, ScoreSubmissionSerializer, 
    ResultadoSerializer, GastoSerializer
)

# Servicios y Reportes
from .services import RankingService, ResultsService
from .reports import generar_pdf_ranking, generar_recibo_pdf, generar_diploma_pdf

# --- VIEWSETS ---

class InscripcionViewSet(viewsets.ModelViewSet):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Optimización: Cargamos relaciones clave automáticamente"""
        return Inscripcion.objects.select_related('deportista', 'competencia', 'club')

    @action(detail=True, methods=['get'])
    def print_receipt(self, request, pk=None):
        # Optimizamos trayendo las participaciones y categorías en una sola query
        try:
            inscripcion = self.get_queryset().prefetch_related(
                'participaciones__categoria', 
                'participaciones__modalidad'
            ).get(pk=pk)
        except Inscripcion.DoesNotExist:
            return Response({"detail": "No encontrado"}, status=404)

        response = HttpResponse(content_type='application/pdf')
        filename = f"Recibo_{inscripcion.id}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        # Generar PDF (ahora es rápido porque los datos ya están en memoria)
        generar_recibo_pdf(response, inscripcion)
        
        return response


class CompetenciaViewSet(viewsets.ModelViewSet):
    queryset = Competencia.objects.all()
    serializer_class = CompetenciaSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def close_competition(self, request, pk=None):
        competencia = self.get_object()
        if competencia.status == 'Finalizada': 
            return Response({"detail": "La competencia ya está cerrada."}, status=400)
        
        competencia.status = 'Finalizada'
        competencia.save()
        return Response({"message": "Competencia finalizada correctamente."}, status=200)

    @action(detail=True, methods=['get'])
    def generate_report(self, request, pk=None):
        competencia = self.get_object()
        
        # Delegamos la lógica compleja al servicio
        ranking_data = RankingService.get_ranking_competencia_pdf(competencia)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Ranking_{competencia.id}.pdf"'
        
        generar_pdf_ranking(response, competencia, ranking_data)
        return response

    @action(detail=True, methods=['get'])
    def official_results(self, request, pk=None):
        """Endpoint optimizado: Delega todo al Servicio"""
        competencia = self.get_object()
        data = ResultsService.get_official_results_data(competencia)
        return Response(data)


class ResultadoViewSet(viewsets.ModelViewSet):
    queryset = Resultado.objects.all()
    serializer_class = ResultadoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def print_diploma(self, request, pk=None):
        # Optimización crítica: Cargamos toda la cadena de relaciones necesaria para el diploma
        try:
            resultado = Resultado.objects.select_related(
                'inscripcion__deportista',
                'inscripcion__competencia',
                'inscripcion__club'
            ).prefetch_related(
                'inscripcion__participaciones__modalidad',
                'inscripcion__participaciones__categoria'
            ).get(pk=pk)
        except Resultado.DoesNotExist:
            return Response({"detail": "Resultado no encontrado"}, status=404)

        if resultado.es_descalificado:
             return Response({"detail": "Deportista descalificado, no se puede generar diploma."}, status=400)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Diploma_{resultado.id}.pdf"'
        
        generar_diploma_pdf(response, resultado)
        return response


class AnnualRankingView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        year = request.query_params.get('year', date.today().year)
        try:
            year = int(year)
        except ValueError:
            year = date.today().year

        data_dep, _ = RankingService.calcular_puntos_anuales(year)
        
        res = {'year': year, 'rankings_por_modalidad': []}
        for mod, dict_dep in data_dep.items():
            lst = [
                {
                    'deportista': f"{d['nombre']} {d['apellidos']}", 
                    'club': d['club'], 
                    'puntaje_total': d['puntaje_acumulado'], 
                    'eventos_disputados': d['eventos']
                } 
                for d in dict_dep.values()
            ]
            lst.sort(key=lambda x: x['puntaje_total'], reverse=True)
            
            for idx, item in enumerate(lst): 
                item['posicion'] = idx + 1
                
            res['rankings_por_modalidad'].append({'modalidad': mod, 'ranking': lst})
            
        return Response(res)


class ClubRankingView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        year = request.query_params.get('year', date.today().year)
        try:
            year = int(year)
        except ValueError:
            year = date.today().year

        _, data_clubes = RankingService.calcular_puntos_anuales(year)
        
        lst = [{'club': n, 'puntos': p} for n, p in data_clubes.items()]
        lst.sort(key=lambda x: x['puntos'], reverse=True)
        
        for idx, item in enumerate(lst): 
            item['posicion'] = idx + 1
            
        return Response(lst)


class DepartmentalRecordsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Optimizamos la carga de Récords
        recs = Record.objects.filter(
            es_actual=True, 
            deportista__es_invitado=False
        ).select_related(
            'deportista', 'modalidad', 'categoria', 'competencia', 
            'antecesor__deportista'
        ).order_by('modalidad__name')
        
        data = []
        for r in recs:
            it = {
                'modalidad': r.modalidad.name, 
                'categoria': r.categoria.name, 
                'actual': {
                    'deportista': f"{r.deportista.first_name} {r.deportista.apellido_paterno}", 
                    'puntaje': r.puntaje, 
                    'fecha': r.fecha_registro, 
                    'competencia': r.competencia.name
                }, 
                'anterior': None
            }
            if r.antecesor: 
                it['anterior'] = {
                    'deportista': f"{r.antecesor.deportista.first_name} {r.antecesor.deportista.apellido_paterno}", 
                    'puntaje': r.antecesor.puntaje
                }
            data.append(it)
        return Response(data)

# --- CRUD SIMPLE (Manteniendo la limpieza) ---
class PoligonoViewSet(viewsets.ModelViewSet): 
    queryset = Poligono.objects.all()
    serializer_class = PoligonoSerializer
    permission_classes = [IsAuthenticated]

class JuezViewSet(viewsets.ModelViewSet):
    queryset = Juez.objects.all()
    serializer_class = JuezSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def create_access(self, request, pk=None):
        return Response({"message": "Acceso generado"})

class ModalidadViewSet(viewsets.ModelViewSet): 
    queryset = Modalidad.objects.all()
    serializer_class = ModalidadSerializer
    permission_classes = [IsAuthenticated]

class CategoriaViewSet(viewsets.ModelViewSet): 
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

class GastoViewSet(viewsets.ModelViewSet): 
    queryset = Gasto.objects.all()
    serializer_class = GastoSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(registrado_por=self.request.user)

class InscripcionCreateAPIView(generics.CreateAPIView): 
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionCreateSerializer
    permission_classes = [IsAuthenticated]

class ScoreSubmissionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = ScoreSubmissionSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        resultado = serializer.save() 
        return Response(ResultadoSerializer(resultado).data, status=200)
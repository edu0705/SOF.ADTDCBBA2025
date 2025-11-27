from django.http import HttpResponse
from django.core.exceptions import ValidationError

# DRF Imports
from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

# Modelos
from .models import (
    Competencia, Modalidad, Categoria, Poligono, Juez, 
    Inscripcion, Resultado, Gasto, CategoriaCompetencia # <--- Importamos modelo intermedio
)

# Serializadores
from .serializers import (
    CompetenciaSerializer, ModalidadSerializer, CategoriaSerializer, 
    PoligonoSerializer, JuezSerializer, InscripcionSerializer, 
    InscripcionCreateSerializer, ScoreSubmissionSerializer, 
    ResultadoSerializer, GastoSerializer,
    CategoriaCompetenciaInfoSerializer # <--- Importamos nuevo serializer
)

# Capa de Servicios
from .services import (
    CompetitionService, 
    ResultsService, 
    RankingService, 
    ReportService
)
from .reports import generar_pdf_ranking, generar_recibo_pdf, generar_diploma_pdf

# --- VIEWSETS PRINCIPALES ---

class InscripcionViewSet(viewsets.ModelViewSet):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Inscripcion.objects.select_related('deportista', 'competencia', 'club')

    @action(detail=True, methods=['get'])
    def print_receipt(self, request, pk=None):
        """Genera el recibo de inscripción en PDF."""
        inscripcion = self.get_object()
        response = HttpResponse(content_type='application/pdf')
        filename = f"Recibo_{inscripcion.id}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        generar_recibo_pdf(response, inscripcion)
        return response


class CompetenciaViewSet(viewsets.ModelViewSet):
    queryset = Competencia.objects.all()
    serializer_class = CompetenciaSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def close_competition(self, request, pk=None):
        """Finaliza una competencia usando el servicio de dominio."""
        competencia = self.get_object()
        try:
            CompetitionService.cerrar_competencia(competencia, request.user)
            return Response({"message": "Competencia finalizada correctamente."}, status=200)
        except ValidationError as e:
            return Response({"detail": str(e)}, status=400)

    @action(detail=True, methods=['get'])
    def generate_report(self, request, pk=None):
        """Genera el ranking preliminar en PDF."""
        competencia = self.get_object()
        ranking_data = RankingService.get_ranking_competencia_pdf(competencia)
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Ranking_{competencia.id}.pdf"'
        generar_pdf_ranking(response, competencia, ranking_data)
        return response

    @action(detail=True, methods=['get'])
    def official_results(self, request, pk=None):
        """Obtiene JSON con resultados oficiales para el frontend."""
        competencia = self.get_object()
        data = ResultsService.get_official_results_data(competencia)
        return Response(data)

    # --- NUEVO ENDPOINT PARA COSTOS ---
    @action(detail=True, methods=['get'])
    def categories(self, request, pk=None):
        """
        Devuelve las categorías habilitadas para esta competencia y sus costos específicos.
        Uso: /api/competencias/{id}/categories/
        """
        competencia = self.get_object()
        items = CategoriaCompetencia.objects.filter(competencia=competencia).select_related('categoria', 'categoria__modalidad')
        serializer = CategoriaCompetenciaInfoSerializer(items, many=True)
        return Response(serializer.data)


class ResultadoViewSet(viewsets.ModelViewSet):
    queryset = Resultado.objects.all()
    serializer_class = ResultadoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def print_diploma(self, request, pk=None):
        """Genera diploma de participación."""
        resultado = self.get_object()
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Diploma_{resultado.id}.pdf"'
        generar_diploma_pdf(response, resultado)
        return response

# --- VIEWSETS DE REPORTES ---

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def poligono_stats(self, request):
        if not hasattr(request.user, 'poligono_administrado'):
            return Response({"detail": "Acceso denegado. No eres administrador de un polígono."}, status=403)
        year = request.query_params.get('year')
        year_int = int(year) if year and year.isdigit() else None
        data = ReportService.get_poligono_report(request.user, year_int)
        return Response(data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def reafuc_arma(self, request):
        matricula = request.query_params.get('matricula')
        if not matricula: return Response({"detail": "Falta 'matricula'."}, status=400)
        data = ReportService.get_reafuc_arma_traceability(matricula)
        if not data: return Response({"detail": "Arma no encontrada."}, status=404)
        return Response(data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def reafuc_deportista(self, request):
        search = request.query_params.get('q')
        if not search: return Response({"detail": "Falta parámetro 'q'."}, status=400)
        data = ReportService.get_reafuc_deportista_kardex(search)
        if not data: return Response({"detail": "Deportista no encontrado."}, status=404)
        return Response(data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def trimestral(self, request):
        year = request.query_params.get('year')
        quarter = request.query_params.get('quarter')
        if not year or not quarter: return Response({"detail": "Faltan 'year' y 'quarter'."}, status=400)
        try:
            data = ReportService.get_quarterly_report(int(year), int(quarter))
            return Response(data)
        except ValueError: return Response({"detail": "Parámetros inválidos."}, status=400)

# --- API VIEWS ESPECIALIZADAS ---

class ScoreSubmissionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            resultado = ResultsService.procesar_envio_puntajes(
                data=request.data, 
                context={'request': request}
            )
            return Response(ResultadoSerializer(resultado).data, status=200)
        except ValidationError as e:
            return Response({"detail": e.messages}, status=400)
        except Exception as e:
            print(f"Error procesando puntajes: {e}")
            return Response({"detail": "Error interno.", "error": str(e)}, status=500)

class InscripcionCreateAPIView(generics.CreateAPIView): 
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionCreateSerializer
    permission_classes = [IsAuthenticated]

# --- CRUD BÁSICO ---

class PoligonoViewSet(viewsets.ModelViewSet): 
    queryset = Poligono.objects.all()
    serializer_class = PoligonoSerializer
    permission_classes = [IsAuthenticated]

class JuezViewSet(viewsets.ModelViewSet):
    queryset = Juez.objects.all()
    serializer_class = JuezSerializer
    permission_classes = [IsAuthenticated]

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

# --- PLACEHOLDERS LEGACY ---
class AnnualRankingView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request): return Response({"detail": "Usar /api/reports/trimestral/"})

class ClubRankingView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request): return Response({"detail": "En construcción"})

class DepartmentalRecordsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request): return Response({"detail": "En construcción"})
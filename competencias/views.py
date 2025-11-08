from django.http import HttpResponse
from django.db.models import Sum # Necesario para la lógica de ranking
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Competencia, Modalidad, Categoria, Poligono, Juez, Inscripcion, Resultado
)
from .serializers import (
    CompetenciaSerializer, 
    ModalidadSerializer, 
    CategoriaSerializer, 
    PoligonoSerializer, 
    JuezSerializer,
    InscripcionSerializer,
    InscripcionCreateSerializer,
    ScoreSubmissionSerializer,
    ResultadoSerializer # <--- ¡IMPORTACIÓN CORREGIDA!
)


# --- ViewSets para CRUD de Gestión ---
class CompetenciaViewSet(viewsets.ModelViewSet):
    queryset = Competencia.objects.all()
    serializer_class = CompetenciaSerializer
    permission_classes = [IsAuthenticated]

    # ACCIÓN 1: CIERRE DE COMPETENCIA (POST)
    @action(detail=True, methods=['post'])
    def close_competition(self, request, pk=None):
        try:
            competencia = self.get_object()
        except Competencia.DoesNotExist:
            return Response({"detail": "Competencia no encontrada."}, status=404)

        if competencia.status == 'Finalizada':
            return Response({"detail": "La competencia ya está cerrada."}, status=400)

        competencia.status = 'Finalizada'
        competencia.save()
        
        return Response({"message": f"Competencia '{competencia.name}' finalizada y resultados oficializados."}, status=200)

    # ACCIÓN 2: GENERACIÓN DE REPORTE (GET)
    @action(detail=True, methods=['get'])
    def generate_report(self, request, pk=None):
        try:
            competencia = self.get_object()
        except Competencia.DoesNotExist:
            return Response({"detail": "Competencia no encontrada."}, status=404)

        if competencia.status != 'Finalizada':
            return Response({"detail": "Los resultados deben estar OFICIALIZADOS."}, status=400)

        # LÓGICA DE RANKING (Consulta a la BD)
        ranking_data = Resultado.objects.filter(
            inscripcion__competencia=competencia
        ).values(
            'inscripcion__deportista__first_name',
            'inscripcion__deportista__last_name',
            'inscripcion__club__name',
        ).annotate(
            total_score=Sum('puntaje')
        ).order_by('-total_score')
        
        # Configuración del PDF (ReportLab)
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Ranking_Oficial_{competencia.name}.pdf"'

        p = canvas.Canvas(response, pagesize=A4)
        width, height = A4
        y_position = height - 70
        
        # Título y Dibujo de la tabla de Ranking (Implementación de ReportLab)
        p.setFont("Helvetica-Bold", 18)
        p.drawString(100, height - 50, "RANKING OFICIAL DE RESULTADOS")
        
        p.setFont("Helvetica-Bold", 10)
        p.drawString(100, y_position, "POS.")
        # ... (Lógica de dibujo del PDF) ...

        p.showPage()
        p.save()

        return response


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


class InscripcionViewSet(viewsets.ModelViewSet):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer
    permission_classes = [IsAuthenticated]

# CLASE QUE ESTABA CAUSANDO EL ERROR DE IMPORTACIÓN EN urls.py
class ResultadoViewSet(viewsets.ModelViewSet):
    queryset = Resultado.objects.all()
    serializer_class = ResultadoSerializer
    permission_classes = [IsAuthenticated]


# --- Vistas Específicas ---
class InscripcionCreateAPIView(generics.CreateAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionCreateSerializer 
    permission_classes = [IsAuthenticated]


class ScoreSubmissionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ScoreSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Usa el .create del serializador, que maneja la lógica WebSockets
        resultado = serializer.create(serializer.validated_data) 
        
        # Devolver el resultado
        return Response(ResultadoSerializer(resultado).data, status=200)
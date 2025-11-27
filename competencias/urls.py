from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompetenciaViewSet, InscripcionViewSet, ResultadoViewSet, 
    PoligonoViewSet, JuezViewSet, ModalidadViewSet, CategoriaViewSet,
    GastoViewSet, InscripcionCreateAPIView, ScoreSubmissionAPIView,
    ReportViewSet, # Importamos el nuevo ViewSet de reportes
    AnnualRankingView, ClubRankingView, DepartmentalRecordsView
)

router = DefaultRouter()
# Rutas CRUD estándar
router.register(r'competencias', CompetenciaViewSet)
router.register(r'inscripciones', InscripcionViewSet)
router.register(r'resultados', ResultadoViewSet)
router.register(r'poligonos', PoligonoViewSet)
router.register(r'jueces', JuezViewSet)
router.register(r'modalidades', ModalidadViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'gastos', GastoViewSet)

# NUEVA RUTA: Reportes Avanzados
# 'basename' es obligatorio aquí porque ReportViewSet no tiene un 'queryset' directo
router.register(r'reports', ReportViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
    
    # Endpoints de acción específica
    path('inscripciones/create/', InscripcionCreateAPIView.as_view(), name='inscripcion-create'),
    path('submit-score/', ScoreSubmissionAPIView.as_view(), name='submit-score'),
    
    # Endpoints Legacy (Mantenidos por compatibilidad)
    path('rankings/annual/', AnnualRankingView.as_view(), name='annual-ranking'),
    path('rankings/clubs/', ClubRankingView.as_view(), name='club-ranking'),
    path('records/', DepartmentalRecordsView.as_view(), name='records'),
]
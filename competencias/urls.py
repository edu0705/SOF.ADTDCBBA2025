# competencias/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    CompetenciaViewSet, 
    ModalidadViewSet, 
    CategoriaViewSet, 
    PoligonoViewSet, 
    JuezViewSet,
    InscripcionViewSet,
    ResultadoViewSet,
    ScoreSubmissionAPIView, # <-- YA IMPORTADA CORRECTAMENTE
    InscripcionCreateAPIView # <-- ¡IMPORTACIÓN FALTANTE/CORREGIDA!
)

router = DefaultRouter()
# Rutas de ViewSet (Manejan CRUD: GET /competencias/, POST /competencias/)
router.register(r'competencias', CompetenciaViewSet)
router.register(r'modalidades', ModalidadViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'poligonos', PoligonoViewSet)
router.register(r'jueces', JuezViewSet)
router.register(r'inscripciones', InscripcionViewSet)
router.register(r'resultados', ResultadoViewSet) 

urlpatterns = [
    # 1. Incluye todas las rutas del ViewSet (router.register)
    path('', include(router.urls)),
    
    # 2. Rutas Específicas (Que no siguen el patrón RESTful del router)
    path('inscripcion/create/', InscripcionCreateAPIView.as_view(), name='inscripcion-create'),
    path('score/submit/', ScoreSubmissionAPIView.as_view(), name='score-submission'),
]
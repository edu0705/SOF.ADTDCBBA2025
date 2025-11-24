# deportistas/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DeportistaViewSet,
    ArmaViewSet,
    DocumentoViewSet,
    PrestamoArmaViewSet
)

router = DefaultRouter()
# Rutas principales
router.register(r'list', DeportistaViewSet, basename='deportista') # Acceso: /api/deportistas/list/
router.register(r'armas', ArmaViewSet, basename='arma')            # Acceso: /api/deportistas/armas/
router.register(r'documentos', DocumentoViewSet, basename='documento') # Acceso: /api/deportistas/documentos/
router.register(r'prestamos', PrestamoArmaViewSet, basename='prestamo') # Acceso: /api/deportistas/prestamos/

urlpatterns = [
    path('', include(router.urls)),
]
# deportistas/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import DeportistaViewSet, ArmaViewSet

router = DefaultRouter()

# Rutas que React está buscando: /api/deportistas/deportistas/
router.register(r'deportistas', DeportistaViewSet, basename='deportista')

# Rutas que React está buscando: /api/deportistas/armas/
router.register(r'armas', ArmaViewSet, basename='arma')

urlpatterns = [
    path('', include(router.urls)),
]
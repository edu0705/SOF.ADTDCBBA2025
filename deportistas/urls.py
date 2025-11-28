from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeportistaViewSet, ArmaViewSet

# Creamos un router para generar las URLs automáticamente
router = DefaultRouter()

# 1. Ruta: /api/deportistas/ -> Lista de atletas
router.register(r'', DeportistaViewSet, basename='deportista')

# 2. Ruta: /api/deportistas/armas/ -> Lista de armas (Ojo al prefijo 'armas')
# Esto permite que ManageArmas.jsx encuentre los datos en la URL correcta
router.register(r'armas', ArmaViewSet, basename='arma')

urlpatterns = [
    path('', include(router.urls)),
]
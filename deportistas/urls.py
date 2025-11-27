from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DeportistaViewSet, 
    ArmaViewSet, 
    DocumentoDeportistaViewSet, 
    PrestamoArmaViewSet
)

router = DefaultRouter()
router.register(r'deportistas', DeportistaViewSet)
router.register(r'armas', ArmaViewSet)
router.register(r'documentos', DocumentoDeportistaViewSet)
router.register(r'prestamos', PrestamoArmaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
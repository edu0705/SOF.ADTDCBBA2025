from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet

router = DefaultRouter()
# Estandarizamos la ruta a 'list' para que sea consistente con Deportistas
# URL final: /api/clubs/list/
router.register(r'list', ClubViewSet, basename='club')

urlpatterns = [
    path('', include(router.urls)),
]
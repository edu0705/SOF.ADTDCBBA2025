# deportistas/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Max

# Modelos (Importación Correcta de los nuevos nombres)
from .models import Deportista, DocumentoDeportista, Arma, PrestamoArma
from competencias.models import Inscripcion, Resultado

# Serializadores
from .serializers import (
    DeportistaSerializer, 
    DocumentoModelSerializer, 
    ArmaSerializer, 
    PrestamoArmaSerializer
)

class DeportistaViewSet(viewsets.ModelViewSet):
    queryset = Deportista.objects.all()
    serializer_class = DeportistaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filtra los deportistas según el rol del usuario:
        - Admin/Staff: Ve todos.
        - Club: Ve solo los deportistas de su club.
        - Deportista: Se ve a sí mismo.
        """
        user = self.request.user
        
        if user.is_staff:
            return Deportista.objects.all()
        
        if hasattr(user, 'club'):
            return Deportista.objects.filter(club=user.club)
            
        if hasattr(user, 'deportista'):
            return Deportista.objects.filter(id=user.deportista.id)
            
        return Deportista.objects.none()

    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        """Subida de documentos para un deportista específico"""
        deportista = self.get_object()
        file = request.FILES.get('file')
        doc_type = request.data.get('document_type')
        expiration = request.data.get('expiration_date')
        
        if not file or not doc_type:
            return Response({'error': 'Faltan datos.'}, status=400)
            
        doc = DocumentoDeportista.objects.create(
            deportista=deportista,
            document_type=doc_type,
            file=file,
            expiration_date=expiration if expiration else None
        )
        return Response(DocumentoModelSerializer(doc).data, status=201)

    # --- NUEVAS ACCIONES DE ESTADÍSTICAS ---

    @action(detail=False, methods=['get'])
    def stats_me(self, request):
        """Estadísticas del usuario logueado (Mi Perfil)"""
        # 1. Si es deportista, mostramos sus datos reales
        if hasattr(request.user, 'deportista'):
            return self._get_stats_response(request.user.deportista)
        
        # 2. SOLUCIÓN ROBUSTA: Si es Admin/Staff pero no deportista, devolvemos datos "dummy"
        # Esto evita que el Dashboard explote con un 400 Bad Request para el Superusuario
        if request.user.is_staff:
             return Response({
                "competencias_disputadas": 0,
                "mejor_puntaje": 0,
                "total_armas": 0,
                "club": "Administrador",
                "categoria": "Staff"
            })

        # 3. Si no es nada de lo anterior, ahí sí lanzamos error
        return Response({"detail": "No eres un deportista registrado."}, status=400)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Estadísticas de un deportista por ID (Para Admin/Club)"""
        deportista = self.get_object()
        return self._get_stats_response(deportista)

    def _get_stats_response(self, deportista):
        """Lógica auxiliar para calcular estadísticas"""
        # 1. Total Competencias
        total_competencias = Inscripcion.objects.filter(
            deportista=deportista, estado='APROBADA'
        ).count()
        
        # 2. Mejor Puntaje Histórico
        # Buscamos en todas sus inscripciones
        best_score = Resultado.objects.filter(
            inscripcion__deportista=deportista,
            es_descalificado=False
        ).aggregate(max_score=Max('puntaje'))['max_score'] or 0

        # 3. Armas Registradas
        total_armas = deportista.armas.count()

        return Response({
            "competencias_disputadas": total_competencias,
            "mejor_puntaje": best_score,
            "total_armas": total_armas,
            "club": deportista.club.name if deportista.club else "Sin Club",
            "categoria": "General" # Aquí podrías calcular su categoría más frecuente si quisieras
        })


# --- OTROS VIEWSETS ---

class ArmaViewSet(viewsets.ModelViewSet):
    queryset = Arma.objects.all()
    serializer_class = ArmaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff: return Arma.objects.all()
        if hasattr(user, 'club'): return Arma.objects.filter(deportista__club=user.club)
        if hasattr(user, 'deportista'): return Arma.objects.filter(deportista=user.deportista)
        return Arma.objects.none()

class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = DocumentoDeportista.objects.all()
    serializer_class = DocumentoModelSerializer
    permission_classes = [IsAuthenticated]

class PrestamoArmaViewSet(viewsets.ModelViewSet):
    queryset = PrestamoArma.objects.all()
    serializer_class = PrestamoArmaSerializer
    permission_classes = [IsAuthenticated]
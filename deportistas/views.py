from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Deportista, Documento, Arma
from .serializers import DeportistaSerializer, DeportistaRegistrationSerializer, DocumentoSerializer, ArmaSerializer


# --- ViewSets para Operaciones CRUD Básicas (GET, PUT, DELETE) ---
class DeportistaViewSet(viewsets.ModelViewSet):
    # Queryset base (necesario para el router de DRF)
    queryset = Deportista.objects.all() 
    serializer_class = DeportistaSerializer 
    permission_classes = [IsAuthenticated]
    
    # Sobreescribimos get_queryset para aplicar el filtro de seguridad por rol
    def get_queryset(self):
        user = self.request.user
        
        # 1. Filtro para Superusuarios/Presidentes: ven todos los deportistas
        if user.is_superuser or user.groups.filter(name__in=['Presidente', 'Tesorero']).exists():
            return Deportista.objects.all()
        
        # 2. Filtro para Club: solo ven los deportistas vinculados a su Club
        try:
            if user.groups.filter(name='Club').exists():
                # Busca la instancia de Club vinculada al usuario logueado
                return Deportista.objects.filter(club__user=user)
        except Exception:
            # Maneja el caso en que el usuario 'Club' no tenga una entidad Club asociada (error de base de datos)
            return Deportista.objects.none()
        
        # 3. Si el usuario no tiene rol o no está logueado, no ve nada
        return Deportista.objects.none()


class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer
    permission_classes = [IsAuthenticated]

class ArmaViewSet(viewsets.ModelViewSet):
    queryset = Arma.objects.all()
    serializer_class = ArmaSerializer
    permission_classes = [IsAuthenticated]


# --- Vistas Específicas para Flujo de Registro (POST) ---
class DeportistaRegistrationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Usamos el serializador de registro para manejar la lógica anidada y la creación de archivos
        serializer = DeportistaRegistrationSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Deportista registrado con éxito. Pendiente de aprobación."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
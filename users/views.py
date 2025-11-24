# users/views.py
from django.conf import settings
from django.middleware import csrf
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

# Importamos nuestro nuevo Servicio y Serializadores
from .services import NotificationService
from .serializers import UserInfoSerializer

# --- 1. AUTENTICACIÓN SEGURA (Cookies HttpOnly) ---

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except Exception:
            return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')

            # Seteamos cookies seguras
            self._set_auth_cookies(response, access_token, refresh_token)

            # Limpiamos el cuerpo de la respuesta
            del response.data['access']
            del response.data['refresh']
            
            csrf.get_token(request) 
            response.data['message'] = 'Login exitoso via Cookies'

        return response

    def _set_auth_cookies(self, response, access, refresh):
        cookie_params = {
            'secure': settings.AUTH_COOKIE_SECURE,
            'httponly': settings.AUTH_COOKIE_HTTP_ONLY,
            'samesite': settings.AUTH_COOKIE_SAMESITE,
        }
        
        response.set_cookie(
            key=settings.AUTH_COOKIE, 
            value=access, 
            expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            **cookie_params
        )
        response.set_cookie(
            key=settings.AUTH_COOKIE_REFRESH, 
            value=refresh, 
            expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'], 
            **cookie_params
        )

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        
        if not refresh_token:
            return Response({"detail": "No refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

        # Inyectamos el token manualmente para evitar errores de body vacío
        serializer = self.get_serializer(data={"refresh": refresh_token})
        
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)

        # Actualizamos cookies
        access_token = response.data.get('access')
        cookie_params = {
            'secure': settings.AUTH_COOKIE_SECURE,
            'httponly': settings.AUTH_COOKIE_HTTP_ONLY,
            'samesite': settings.AUTH_COOKIE_SAMESITE,
        }

        response.set_cookie(
            key=settings.AUTH_COOKIE, 
            value=access_token, 
            expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            **cookie_params
        )
        
        if 'refresh' in response.data:
            response.set_cookie(
                key=settings.AUTH_COOKIE_REFRESH, 
                value=response.data['refresh'], 
                expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'], 
                **cookie_params
            )
            del response.data['refresh']
            
        if 'access' in response.data: del response.data['access']

        return response

class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logout exitoso"})
        response.delete_cookie(settings.AUTH_COOKIE)
        response.delete_cookie(settings.AUTH_COOKIE_REFRESH)
        return response


# --- 2. VISTAS DE NEGOCIO (Refactorizadas) ---

class UserInfoAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserInfoSerializer(request.user)
        return Response(serializer.data)

class UserNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ¡MIRA QUÉ LIMPIO! Toda la lógica compleja se fue al servicio.
        notifications = NotificationService.get_user_notifications(request.user)
        return Response(notifications)
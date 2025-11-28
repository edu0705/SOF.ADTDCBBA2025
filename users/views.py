from django.conf import settings
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import authenticate, logout

# --- 1. LOGIN CON COOKIES ---
class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Genera los tokens (Access y Refresh) usando la lógica estándar
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            tokens = response.data # Aquí están los tokens en texto plano
            
            # Limpiamos el cuerpo de la respuesta para no exponer tokens en el JSON
            # (El frontend solo necesita saber "OK", no ver el token)
            response.data = {"success": True, "message": "Login exitoso"}

            # INYECTAMOS LA COOKIE DE ACCESO
            response.set_cookie(
                key=settings.AUTH_COOKIE, # 'access'
                value=tokens['access'],
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.AUTH_COOKIE_SECURE, # True en Prod
                httponly=settings.AUTH_COOKIE_HTTP_ONLY, # True siempre
                samesite=settings.AUTH_COOKIE_SAMESITE
            )
            
            # INYECTAMOS LA COOKIE DE REFRESH
            response.set_cookie(
                key=settings.AUTH_COOKIE_REFRESH, # 'refresh'
                value=tokens['refresh'],
                expires=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )
            
        return response

# --- 2. REFRESH CON COOKIES ---
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Si la cookie de refresh está presente, la inyectamos en el body 
        # para que el serializador de SimpleJWT la procese como si viniera en JSON
        refresh_token = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        
        if refresh_token:
            request.data['refresh'] = refresh_token
            
        try:
            response = super().post(request, *args, **kwargs)
        except (InvalidToken, TokenError):
            return Response({"detail": "Token inválido o expirado"}, status=401)

        if response.status_code == 200:
            # Actualizamos la cookie de acceso con el nuevo token
            access_token = response.data['access']
            response.data = {"success": True, "message": "Sesión renovada"}
            
            response.set_cookie(
                key=settings.AUTH_COOKIE,
                value=access_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )
        return response

# --- 3. LOGOUT (Matar Cookies) ---
class LogoutView(APIView):
    def post(self, request):
        logout(request) # Limpia sesión de Django
        response = Response({"success": True, "message": "Logout exitoso"})
        # Borramos las cookies seteándolas vacías y expiradas
        response.delete_cookie(settings.AUTH_COOKIE)
        response.delete_cookie(settings.AUTH_COOKIE_REFRESH)
        return response

# --- 4. DATOS DEL USUARIO (User Info) ---
class UserInfoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Construimos la respuesta con los roles (groups)
        roles = list(user.groups.values_list('name', flat=True))
        
        # Agregamos rol del modelo personalizado si existe
        if hasattr(user, 'role') and user.role:
             roles.append(user.get_role_display())

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'groups': roles, # El frontend usa esto para redirigir
            'is_superuser': user.is_superuser,
            'force_password_change': False # Puedes agregar lógica aquí
        })
# ... (tus imports anteriores)

class UserNotificationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Retornamos una lista vacía para que el frontend esté feliz
        # En el futuro, aquí puedes conectar un modelo real de Notificaciones
        return Response([])
    
@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'success': True, 'csrfToken': get_token(request)})
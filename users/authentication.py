from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed, TokenError
from django.conf import settings

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # 1. Busca en el Header (Bearer ...)
        header = self.get_header(request)
        
        if header is None:
            # 2. Si no hay header, busca en la cookie definida en settings
            cookie_name = getattr(settings, 'AUTH_COOKIE', 'access_token')
            raw_token = request.COOKIES.get(cookie_name)
        else:
            raw_token = self.get_raw_token(header)

        # Si no encontramos token por ningún lado, retornamos None (Usuario Anónimo)
        if raw_token is None:
            return None

        try:
            # Intentamos validar el token
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
            
        except (InvalidToken, TokenError, AuthenticationFailed):
            # CRÍTICO: Si el token está malformado o expirado, no lanzamos error.
            # Retornamos None para que Django trate al usuario como "no logueado"
            # y permita el acceso a vistas públicas (como Login o Refresh)
            return None
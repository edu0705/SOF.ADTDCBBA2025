# users/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # 1. Intentar obtener el token de la Cookie 'access'
        header = self.get_header(request)
        raw_token = None

        if header is None:
            # Si no hay header, buscamos en la cookie
            raw_token = request.COOKIES.get(settings.AUTH_COOKIE)
        else:
            # Si hay header, usamos el comportamiento estándar (opcional, para pruebas en Swagger)
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
        except AuthenticationFailed:
            # Si el token es inválido, retornamos None para que DRF maneje el error
            return None

        return self.get_user(validated_token), validated_token
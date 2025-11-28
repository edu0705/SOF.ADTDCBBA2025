from django.urls import path
from .views import (
    CookieTokenObtainPairView, 
    CookieTokenRefreshView, 
    LogoutView, 
    UserInfoView,
    UserNotificationsView,
    GetCSRFToken # <--- IMPORTANTE: Asegúrate de que esto exista en views.py
)

urlpatterns = [
    # --- AUTENTICACIÓN Y SEGURIDAD ---
    # Rutas finales: /api/auth/login/, /api/auth/refresh/, etc.
    path('login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='token_logout'),
    path('csrf/', GetCSRFToken.as_view(), name='get_csrf_token'), # <--- ¡LA RUTA QUE FALTABA!
    
    # --- DATOS DE USUARIO ---
    path('me/', UserInfoView.as_view(), name='user_info'),
    path('notifications/', UserNotificationsView.as_view(), name='user_notifications'),
]
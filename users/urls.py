from django.urls import path
from .views import (
    CookieTokenObtainPairView, 
    CookieTokenRefreshView, 
    LogoutView, 
    UserInfoView,
    UserNotificationsView  # <--- Asegúrate de importar esto
)

urlpatterns = [
    # Auth Endpoints (Tokens en Cookies)
    path('token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('token/logout/', LogoutView.as_view(), name='token_logout'),
    
    # Datos del Usuario
    path('user-info/', UserInfoView.as_view(), name='user_info'),
    
    # Notificaciones (Mock para evitar error 404)
    path('notifications/', UserNotificationsView.as_view(), name='user_notifications'),
]
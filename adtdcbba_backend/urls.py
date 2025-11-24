from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Importamos nuestras vistas de autenticación personalizadas (Cookies)
from users.views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    LogoutView
)

# Importaciones para la documentación (Swagger)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rutas de la API
    path('api/users/', include('users.urls')),
    path('api/clubs/', include('clubs.urls')),
    path('api/deportistas/', include('deportistas.urls')),
    path('api/competencias/', include('competencias.urls')),
    
    # --- RUTAS DE AUTENTICACIÓN JWT (MODIFICADAS PARA COOKIES) ---
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), # Login
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'), # Refresh silencioso
    path('api/token/logout/', LogoutView.as_view(), name='token_logout'), # Logout

    # --- RUTAS DE DOCUMENTACIÓN ---
    # Descarga el esquema YAML
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Interfaz visual (Swagger UI)
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Configuración para servir archivos en modo DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
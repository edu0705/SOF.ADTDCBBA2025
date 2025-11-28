from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    # Redirección raíz a la documentación
    path('', RedirectView.as_view(url='/api/docs/', permanent=False)),

    path('admin/', admin.site.urls),
    
    # --- API ENDPOINTS ---
    path('api/auth/', include('users.urls')),
    path('api/competencias/', include('competencias.urls')),
    
    # IMPORTANTE: Aquí se gestionan Deportistas Y Armas
    path('api/deportistas/', include('deportistas.urls')),
    
    # ¡ACTIVADO! Ahora el Frontend podrá ver la lista de clubes
    path('api/clubs/', include('clubs.urls')),

    # DOCUMENTACIÓN
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
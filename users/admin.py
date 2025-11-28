from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from .models import User

# --- 1. PERSONALIZACIÓN DE LA MARCA (BRANDING) ---
admin.site.site_header = "ADT System - Administración"
admin.site.site_title = "Portal ADT"
admin.site.index_title = "Panel de Control de Gestión Deportiva"

# Opcional: Desregistrar el modelo de Grupos si no lo vas a usar manualmente
# admin.site.unregister(Group)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Administrador avanzado para usuarios con soporte de Roles.
    """
    model = User
    
    # Qué columnas ver en la lista
    list_display = ('username', 'get_full_name_custom', 'role', 'club', 'is_active', 'is_staff')
    
    # Filtros laterales para búsqueda rápida
    list_filter = ('role', 'is_active', 'club', 'is_staff')
    
    # Buscador (permite buscar por CI también)
    search_fields = ('username', 'first_name', 'last_name', 'email', 'ci')
    
    # Orden
    ordering = ('-date_joined',)

    # Organización del formulario de edición
    fieldsets = (
        ('Credenciales', {'fields': ('username', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name', 'ci', 'email', 'phone')}),
        ('Perfil Deportivo', {'fields': ('role', 'club')}),
        ('Permisos Técnicos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Auditoría', {'fields': ('last_login', 'date_joined')}),
    )

    def get_full_name_custom(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    get_full_name_custom.short_description = "Nombre Completo"
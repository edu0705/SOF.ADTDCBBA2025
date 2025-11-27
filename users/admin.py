from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Administrador avanzado para usuarios.
    Permite gestionar Roles (Juez/Admin) y datos personales.
    """
    model = User
    
    # Columnas que se ven en la lista principal
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    
    # Filtros laterales
    list_filter = ('role', 'is_staff', 'is_active', 'groups')
    
    # Barra de búsqueda (busca por nombre, email o usuario)
    search_fields = ('username', 'first_name', 'last_name', 'email')
    
    # Ordenamiento por defecto
    ordering = ('email',)

    # Configuración de los formularios de edición
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name', 'email', 'role', 'phone')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas Importantes', {'fields': ('last_login', 'date_joined')}),
    )
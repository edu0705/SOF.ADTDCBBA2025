from django.contrib import admin
from .models import Deportista, Arma, DocumentoDeportista, PrestamoArma

# --- INLINES ---
# Esto permite ver y editar Armas y Documentos dentro de la pantalla del Deportista
class ArmaInline(admin.TabularInline):
    model = Arma
    extra = 0
    fields = ('tipo', 'marca', 'modelo', 'calibre', 'serie', 'matricula')

class DocumentoInline(admin.TabularInline):
    model = DocumentoDeportista
    extra = 0
    readonly_fields = ('uploaded_at',)

# --- ADMIN PRINCIPAL ---
@admin.register(Deportista)
class DeportistaAdmin(admin.ModelAdmin):
    # SOLUCIÓN DEL ERROR: Usamos los campos reales en lugar de 'last_name'
    list_display = (
        'codigo_unico',
        'apellido_paterno', 
        'apellido_materno', 
        'first_name', 
        'club', 
        'tipo_modalidad', 
        'status',
        'get_edad_display' # Usamos un método wrapper para mostrar la edad
    )
    
    list_filter = ('status', 'tipo_modalidad', 'club', 'es_invitado', 'departamento_origen')
    
    search_fields = ('first_name', 'apellido_paterno', 'apellido_materno', 'ci', 'codigo_unico')
    
    # Organiza el formulario en pestañas o secciones para que sea más ordenado
    fieldsets = (
        ('Información Personal', {
            'fields': (
                ('first_name', 'apellido_paterno', 'apellido_materno'),
                ('ci', 'fecha_nacimiento'),
                ('email_user_link', 'foto'), # Campo calculado opcional
            )
        }),
        ('Afiliación y Club', {
            'fields': ('club', 'codigo_unico', 'status', 'es_invitado', 'departamento_origen')
        }),
        ('Gestión Deportiva', {
            'fields': ('tipo_modalidad', 'vencimiento_credencial', 'archivo_responsabilidad')
        }),
        ('Suspensiones', {
            'classes': ('collapse',), # Esto hace que la sección inicie colapsada
            'fields': ('motivo_suspension', 'fecha_suspension', 'suspension_indefinida', 'fin_suspension')
        }),
    )

    inlines = [DocumentoInline, ArmaInline]
    
    # Método para mostrar la edad en la lista (wrapper del modelo)
    @admin.display(description='Edad', ordering='fecha_nacimiento')
    def get_edad_display(self, obj):
        return obj.get_edad()

    # Opcional: Para mostrar el link al usuario de Django asociado
    @admin.display(description='Usuario Sistema')
    def email_user_link(self, obj):
        return obj.user.email if obj.user else "-"

# --- OTROS REGISTROS ---

@admin.register(Arma)
class ArmaAdmin(admin.ModelAdmin):
    list_display = ('marca', 'modelo', 'calibre', 'serie', 'deportista', 'tipo')
    search_fields = ('serie', 'marca', 'deportista__apellido_paterno', 'deportista__ci')
    list_filter = ('tipo', 'es_aire_comprimido')
@admin.register(PrestamoArma)
class PrestamoArmaAdmin(admin.ModelAdmin):
    list_display = ('arma', 'competencia', 'deportista_propietario', 'deportista_receptor', 'fecha_prestamo')
    list_filter = ('fecha_prestamo', 'competencia')
    search_fields = ('arma__serie', 'deportista_receptor__apellido_paterno')
# deportistas/admin.py

from django.contrib import admin
from .models import Deportista, Documento, Arma

# --- Inlines para la Edición Anidada ---

class DocumentoInline(admin.StackedInline):
    model = Documento
    extra = 0 # Mostrar solo los que existen (no formularios vacíos)
    # Permite al admin ver el archivo subido
    readonly_fields = ('file_path',) 
    fields = ('document_type', 'expiration_date', 'file_path') 
    can_delete = False

class ArmaInline(admin.StackedInline):
    model = Arma
    extra = 0
    readonly_fields = ('file_path',)
    fields = ('tipo', 'calibre', 'marca', 'modelo', 'numero_matricula', 'fecha_inspeccion', 'file_path')
    can_delete = False

# --- Modelo Principal para Deportista ---
class DeportistaAdmin(admin.ModelAdmin):
    # Usa los inlines para mostrar Documentos y Armas en la página de edición
    inlines = [DocumentoInline, ArmaInline] 
    
    # Campos visibles en el listado de la tabla principal
    list_display = ('first_name', 'last_name', 'club', 'status')
    list_filter = ('status', 'club') # Permite filtrar por estado y club
    search_fields = ('first_name', 'last_name', 'ci')

    # Organización de campos en la forma de edición
    fieldsets = (
        ('Información Personal', {
            'fields': (('first_name', 'last_name'), 'ci', ('birth_date', 'genero'), ('departamento', 'telefono')),
        }),
        ('Control y Afiliación', {
            # Incluimos notas_admin para que el Presidente vea o escriba el motivo de rechazo/suspensión
            'fields': ('user', 'club', 'status', 'notas_admin'), 
        }),
    )

# --- Registra los modelos con sus clases Admin ---
admin.site.register(Deportista, DeportistaAdmin)
admin.site.register(Documento)
admin.site.register(Arma)
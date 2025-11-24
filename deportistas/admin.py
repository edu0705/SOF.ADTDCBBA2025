# deportistas/admin.py
from django.contrib import admin
from .models import Deportista, DocumentoDeportista, Arma, PrestamoArma

class DocumentoInline(admin.TabularInline):
    model = DocumentoDeportista
    extra = 0 

class ArmaInline(admin.TabularInline):
    model = Arma
    extra = 0

@admin.register(Deportista)
class DeportistaAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'apellido_paterno', 'club', 'status', 'ci')
    search_fields = ('first_name', 'apellido_paterno', 'ci')
    
    # CORRECCIÓN: Eliminamos el campo inexistente y ponemos filtros válidos
    list_filter = ('status', 'club', 'es_invitado') 
    
    inlines = [DocumentoInline, ArmaInline]
    
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Arma)
class ArmaAdmin(admin.ModelAdmin):
    list_display = ('marca', 'modelo', 'calibre', 'tipo', 'deportista', 'fecha_inspeccion')
    search_fields = ('serie', 'matricula', 'deportista__first_name', 'deportista__apellido_paterno')
    list_filter = ('tipo', 'es_aire_comprimido')

@admin.register(PrestamoArma)
class PrestamoArmaAdmin(admin.ModelAdmin):
    list_display = ('arma', 'deportista_propietario', 'deportista_receptor', 'competencia', 'fecha_prestamo')
    search_fields = ('arma__serie', 'deportista_receptor__apellido_paterno')
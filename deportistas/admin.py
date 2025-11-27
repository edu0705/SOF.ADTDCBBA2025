from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from .models import Deportista, Arma, DocumentoDeportista, PrestamoArma
# Importamos el generador de reportes (Asegúrate de haber creado competencias/reports.py)
from competencias.reports import generar_credencial_pdf

class DocumentoInline(admin.TabularInline):
    model = DocumentoDeportista
    extra = 0

@admin.register(Deportista)
class DeportistaAdmin(admin.ModelAdmin):
    # Campos visibles en la lista (incluyendo los nuevos de lógica de negocio)
    list_display = ('nombre_completo', 'ci', 'club', 'status', 'tipo_modalidad', 'vencimiento_credencial')
    
    # Buscador potente
    search_fields = ('first_name', 'apellido_paterno', 'apellido_materno', 'ci', 'codigo_unico')
    
    # Filtros laterales
    list_filter = ('club', 'status', 'es_invitado', 'tipo_modalidad')
    
    inlines = [DocumentoInline]
    actions = ['imprimir_credencial']

    def nombre_completo(self, obj):
        return f"{obj.first_name} {obj.apellido_paterno}"
    nombre_completo.short_description = "Nombre Completo"

    @admin.action(description='🪪 Imprimir Credencial PDF')
    def imprimir_credencial(self, request, queryset):
        """
        Genera un PDF con la credencial del deportista seleccionado.
        """
        if queryset.count() == 1:
            deportista = queryset.first()
            response = HttpResponse(content_type='application/pdf')
            # Nombre del archivo para descargar
            filename = f"Credencial_{deportista.ci}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            # Llamamos al motor de reportes
            generar_credencial_pdf(response, deportista)
            return response
        else:
            self.message_user(request, "Por favor, seleccione solo un deportista a la vez para imprimir su credencial.", level='warning')

@admin.register(Arma)
class ArmaAdmin(admin.ModelAdmin):
    list_display = ('marca', 'modelo', 'calibre', 'serie', 'deportista', 'tipo')
    search_fields = ('serie', 'matricula', 'marca', 'deportista__first_name', 'deportista__apellido_paterno')
    list_filter = ('tipo', 'es_aire_comprimido')
    autocomplete_fields = ['deportista'] 

@admin.register(PrestamoArma)
class PrestamoArmaAdmin(admin.ModelAdmin):
    list_display = ('arma', 'deportista_propietario', 'deportista_receptor', 'competencia', 'fecha_prestamo')
    autocomplete_fields = ['arma', 'deportista_propietario', 'deportista_receptor', 'competencia']
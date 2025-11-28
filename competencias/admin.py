from django.contrib import admin
from .models import (
    Poligono, Juez, Modalidad, Categoria, Competencia, 
    CategoriaCompetencia, Inscripcion, Participacion, 
    Resultado, Gasto, Record, AutoridadFirma
)

# --- INLINES ---

class CategoriaCompetenciaInline(admin.TabularInline):
    """
    Permite agregar categorías a la competencia y definir su costo
    directamente desde la pantalla de edición de la Competencia.
    """
    model = CategoriaCompetencia
    extra = 1
    autocomplete_fields = ['categoria'] 

class ParticipacionInline(admin.TabularInline):
    model = Participacion
    extra = 0
    autocomplete_fields = ['categoria', 'arma_utilizada']

class ResultadoInline(admin.StackedInline):
    model = Resultado
    extra = 0

class GastoInline(admin.TabularInline):
    model = Gasto
    extra = 0

# --- ADMINS ---

@admin.register(Poligono)
class PoligonoAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'numero_licencia')
    search_fields = ('name',)

@admin.register(Juez)
class JuezAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'license_number')
    search_fields = ('full_name',)

@admin.register(Modalidad)
class ModalidadAdmin(admin.ModelAdmin):
    list_display = ('name', 'es_fuego')
    list_filter = ('es_fuego',)
    search_fields = ('name',)

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('name', 'modalidad', 'calibre_permitido')
    list_filter = ('modalidad',)
    search_fields = ('name', 'modalidad__name')

@admin.register(Competencia)
class CompetenciaAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'type', 'status', 'poligono')
    list_filter = ('status', 'type', 'start_date')
    search_fields = ('name',)
    date_hierarchy = ('start_date',)
    
    inlines = [CategoriaCompetenciaInline, GastoInline]
    
    fieldsets = (
        ('Información General', {
            'fields': ('name', 'type', 'status', 'poligono')
        }),
        ('Fechas', {
            'fields': ('start_date', 'end_date')
        }),
        ('Económico', {
            'fields': ('costo_inscripcion_base', 'banco_info', 'contacto_nombre')
        }),
        ('Personal', {
            'fields': ('jueces',)
        }),
    )
    filter_horizontal = ('jueces',)

@admin.register(Inscripcion)
class InscripcionAdmin(admin.ModelAdmin):
    list_display = ('deportista', 'competencia', 'club', 'estado', 'monto_pagado')
    list_filter = ('estado', 'competencia', 'club')
    # search_fields requiere que DeportistaAdmin tenga search_fields configurado también
    search_fields = ('deportista__first_name', 'deportista__apellido_paterno', 'competencia__name')
    autocomplete_fields = ['deportista', 'competencia']
    
    inlines = [ParticipacionInline, ResultadoInline]
    
    actions = ['marcar_pagado']

    def marcar_pagado(self, request, queryset):
        queryset.update(estado='CONFIRMADA')
    marcar_pagado.short_description = "Marcar como Confirmada/Pagada"

@admin.register(Resultado)
class ResultadoAdmin(admin.ModelAdmin):
    list_display = ('inscripcion', 'puntaje', 'es_descalificado')
    list_filter = ('es_descalificado', 'inscripcion__competencia')

@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ('deportista', 'categoria', 'puntaje', 'fecha_logro')
    list_filter = ('modalidad',)

@admin.register(AutoridadFirma)
class AutoridadFirmaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'cargo', 'activo')
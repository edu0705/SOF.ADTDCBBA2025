from django.contrib import admin
from django.http import HttpResponse
from django.db.models import Sum
from .models import (
    Competencia, Modalidad, Categoria, Poligono, Juez, 
    Inscripcion, Resultado, Gasto, Record
)
# Importamos el generador de certificados
from .reports import generar_diploma_pdf

# --- INLINES ---

class ResultadoInline(admin.TabularInline):
    model = Resultado
    extra = 0 
    fields = ('ronda_o_serie', 'puntaje', 'es_descalificado', 'juez_que_registro')
    readonly_fields = ('fecha_registro',)

class InscripcionInline(admin.TabularInline):
    model = Inscripcion
    extra = 0
    autocomplete_fields = ['deportista', 'club']
    fields = ('deportista', 'club', 'estado', 'costo_inscripcion', 'monto_pagado')
    readonly_fields = ('costo_inscripcion',) # Calculado automáticamente
    show_change_link = True

class GastoInline(admin.TabularInline):
    """Permite registrar los egresos directamente en la competencia."""
    model = Gasto
    extra = 0
    fields = ('descripcion', 'monto', 'fecha')
    readonly_fields = ('fecha',)

# --- ADMINS PRINCIPALES ---

@admin.register(Competencia)
class CompetenciaAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'status', 'ver_balance_financiero')
    list_filter = ('status', 'start_date', 'type')
    search_fields = ('name',)
    
    filter_horizontal = ('jueces',) 
    # Agregamos GastoInline para gestionar egresos aquí mismo
    inlines = [InscripcionInline, GastoInline]
    
    # Agregamos el balance financiero en la vista de detalle (formulario)
    readonly_fields = ('ver_balance_detalle',) 

    actions = ['marcar_finalizada']

    @admin.action(description='Marcar competencias seleccionadas como Finalizadas')
    def marcar_finalizada(self, request, queryset):
        queryset.update(status='Finalizada')

    # Vista rápida en la lista
    def ver_balance_financiero(self, obj):
        ingresos = obj.inscripciones.aggregate(total=Sum('monto_pagado'))['total'] or 0
        egresos = obj.gastos.aggregate(total=Sum('monto'))['total'] or 0
        balance = ingresos - egresos
        return f"{balance} Bs"
    ver_balance_financiero.short_description = "Balance Neto"

    # Vista detallada dentro del formulario
    def ver_balance_detalle(self, obj):
        ingresos = obj.inscripciones.aggregate(total=Sum('monto_pagado'))['total'] or 0
        egresos = obj.gastos.aggregate(total=Sum('monto'))['total'] or 0
        balance = ingresos - egresos
        return f"INGRESOS (Inscripciones): {ingresos} Bs  |  EGRESOS (Gastos): {egresos} Bs  |  TOTAL CAJA: {balance} Bs"
    ver_balance_detalle.short_description = "Resumen Financiero Oficial"

@admin.register(Inscripcion)
class InscripcionAdmin(admin.ModelAdmin):
    # Agregamos las columnas solicitadas: Modalidades inscritas y Totales
    list_display = ('id', 'deportista', 'ver_modalidades', 'estado', 'costo_inscripcion', 'monto_pagado')
    list_filter = ('competencia', 'club', 'estado')
    search_fields = ('deportista__first_name', 'deportista__apellido_paterno', 'competencia__name')
    autocomplete_fields = ['deportista', 'competencia', 'club']
    inlines = [ResultadoInline]
    readonly_fields = ('costo_inscripcion',)

    def ver_modalidades(self, obj):
        """Muestra las modalidades y categorías en las que se inscribió."""
        participaciones = obj.participaciones.select_related('modalidad', 'categoria').all()
        if not participaciones:
            return "Sin participaciones"
        return ", ".join([f"{p.modalidad.name} ({p.categoria.name})" for p in participaciones])
    ver_modalidades.short_description = "Modalidades / Categorías"

@admin.register(Resultado)
class ResultadoAdmin(admin.ModelAdmin):
    list_display = ('inscripcion', 'ronda_o_serie', 'puntaje', 'es_descalificado', 'juez_que_registro')
    list_filter = ('inscripcion__competencia', 'es_descalificado')
    search_fields = ('inscripcion__deportista__first_name',)
    readonly_fields = ('codigo_verificacion', 'fecha_registro')
    
    actions = ['imprimir_certificado']

    @admin.action(description='🎓 Imprimir Certificado con QR')
    def imprimir_certificado(self, request, queryset):
        if queryset.count() == 1:
            resultado = queryset.first()
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Certificado_{resultado.id}.pdf"'
            generar_diploma_pdf(response, resultado)
            return response
        else:
            self.message_user(request, "Por favor, seleccione solo un resultado a la vez para imprimir el certificado.", level='warning')

# --- CONFIGURACIÓN BÁSICA ---

@admin.register(Modalidad)
class ModalidadAdmin(admin.ModelAdmin):
    list_display = ('name', 'es_fuego')
    search_fields = ('name',)
    list_filter = ('es_fuego',)

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('name', 'modalidad', 'calibre_permitido')
    list_filter = ('modalidad',)

@admin.register(Poligono)
class PoligonoAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'numero_licencia', 'user')
    search_fields = ('name', 'user__username')

@admin.register(Juez)
class JuezAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'license_number')
    search_fields = ('full_name',)

@admin.register(Gasto)
class GastoAdmin(admin.ModelAdmin):
    list_display = ('descripcion', 'monto', 'competencia', 'fecha')
    list_filter = ('competencia',)
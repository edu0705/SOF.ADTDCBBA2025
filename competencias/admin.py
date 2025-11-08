# competencias/admin.py

from django.contrib import admin
from django.utils import timezone 
from .models import (
    Poligono, 
    Juez, 
    Modalidad, 
    Categoria, 
    Competencia,
    Inscripcion,
    Participacion, # <-- Modelo de Inscripción Múltiple
    Resultado    
)

# --- Inlines para la Edición Anidada ---

# Inline para mostrar qué modalidades se inscribieron
class ParticipacionInline(admin.TabularInline): 
    model = Participacion
    extra = 0
    # Muestra la modalidad y el arma específica
    fields = ('modalidad', 'arma_utilizada') 
    readonly_fields = ('modalidad', 'arma_utilizada') # El Tesorero solo debe VER esto, no cambiarlo

# --- Modelo Principal para Inscripción ---
class InscripcionAdmin(admin.ModelAdmin):
    inlines = [ParticipacionInline]
    list_display = ('deportista', 'competencia', 'club', 'estado', 'costo_inscripcion')
    list_filter = ('estado', 'competencia', 'club')
    search_fields = ('deportista__first_name', 'competencia__name')

    # Organización de campos en la forma de edición
    fieldsets = (
        ('Información General', {
            'fields': ('competencia', 'deportista', 'club'),
        }),
        ('Aprobación y Costo', {
            # Estos son los campos que el Tesorero DEBE modificar
            'fields': ('estado', 'costo_inscripcion', 'approved_by', 'approved_at'),
        }),
    )
    
    # Lógica para registrar quién aprobó la inscripción
    def save_model(self, request, obj, form, change):
        if obj.estado == 'APROBADA' and not obj.approved_by:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        super().save_model(request, obj, form, change)

# --- Registra los modelos con sus clases Admin ---

admin.site.register(Competencia)
admin.site.register(Inscripcion, InscripcionAdmin)
admin.site.register(Participacion) 
admin.site.register(Resultado)

admin.site.register(Poligono)
admin.site.register(Juez)
admin.site.register(Modalidad)
admin.site.register(Categoria)
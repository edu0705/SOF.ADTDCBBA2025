from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import uuid
from decimal import Decimal
from adtdcbba_backend.validators import validate_file_integrity

class Poligono(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='poligono_administrado', verbose_name="Administrador del Polígono")
    name = models.CharField("Nombre", max_length=100)
    address = models.CharField("Dirección", max_length=200)
    numero_licencia = models.CharField("Licencia", max_length=50, blank=True, null=True)
    fecha_vencimiento_licencia = models.DateField("Vencimiento Licencia", blank=True, null=True)
    def __str__(self): return self.name

class Modalidad(models.Model):
    name = models.CharField("Nombre", max_length=100, unique=True)
    es_fuego = models.BooleanField("Es Arma de Fuego", default=True, help_text="Si se marca, exige Licencia B o Categoría Mixta/Fuego (excepto menores).")
    def __str__(self): return self.name

class Categoria(models.Model):
    name = models.CharField("Nombre", max_length=100)
    modalidad = models.ForeignKey(Modalidad, on_delete=models.CASCADE, related_name='categorias')
    calibre_permitido = models.CharField("Calibre", max_length=50, blank=True, null=True)
    def __str__(self): return f"{self.modalidad.name} - {self.name}"

class Juez(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='juez_profile')
    full_name = models.CharField("Nombre Completo", max_length=100)
    license_number = models.CharField("Nro Licencia", max_length=50)
    def __str__(self): return self.full_name

# --- [NUEVO] GESTIÓN DE FIRMAS ---
class AutoridadFirma(models.Model):
    nombre = models.CharField("Nombre y Apellido", max_length=100)
    cargo = models.CharField("Cargo Institucional", max_length=100, help_text="Ej: Presidente, Director de Competencia")
    firma_imagen = models.ImageField(
        "Imagen de Firma (PNG Transparente)", 
        upload_to='firmas/', 
        validators=[validate_file_integrity],
        help_text="Subir firma escaneada en fondo transparente para los reportes."
    )
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Autoridad / Firma"
        verbose_name_plural = "Autoridades y Firmas"

    def __str__(self): return f"{self.nombre} - {self.cargo}"

class Competencia(models.Model):
    COMPETITION_TYPES = (('Departamental', 'Departamental'), ('Nacional', 'Nacional'))
    STATUS_CHOICES = (('Próxima', 'Próxima'), ('En Progreso', 'En Progreso'), ('Finalizada', 'Finalizada'))
    
    name = models.CharField("Nombre", max_length=200)
    description = models.TextField("Descripción", blank=True, null=True)
    start_date = models.DateField("Fecha Inicio")
    end_date = models.DateField("Fecha Fin")
    poligono = models.ForeignKey(Poligono, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.CharField("Tipo", max_length=50, choices=COMPETITION_TYPES)
    status = models.CharField("Estado", max_length=50, choices=STATUS_CHOICES, default='Próxima')
    
    # --- COSTOS ---
    costo_inscripcion_base = models.DecimalField("Costo Base", max_digits=10, decimal_places=2, default=0.00)
    costo_limite_global = models.DecimalField("Costo Máximo Global", max_digits=10, decimal_places=2, blank=True, null=True, help_text="Límite máximo que pagará un deportista.")
    
    # --- DATOS PARA CONVOCATORIA ---
    hora_apertura = models.TimeField("Apertura Polígono (Céreo)", default="08:00")
    hora_competencia = models.TimeField("Inicio Competencia", default="09:00")
    
    contacto_nombre = models.CharField("Nombre Contacto", max_length=100, blank=True, null=True)
    contacto_telefono = models.CharField("Teléfono Contacto", max_length=50, blank=True, null=True)
    
    # Info bancaria limpia (sin default, totalmente editable)
    banco_info = models.TextField("Info Bancaria / Pago", blank=True, null=True, help_text="Ingrese la cuenta bancaria o instrucciones de pago para esta competencia.")
    
    numero_convocatoria = models.CharField("Nro Convocatoria", max_length=20, blank=True, null=True)
    archivo_convocatoria = models.FileField("PDF Convocatoria (Manual)", upload_to='convocatorias/', blank=True, null=True)
    resultados_pdf = models.FileField("PDF Resultados", upload_to='resultados_competencias/', blank=True, null=True)
    
    # Relaciones
    categorias = models.ManyToManyField(Categoria, through='CategoriaCompetencia', related_name='competencias')
    jueces = models.ManyToManyField(Juez, related_name='competencias')
    
    # --- [NUEVO] FIRMAS PARA ESTA COMPETENCIA ---
    firmas_reportes = models.ManyToManyField(
        AutoridadFirma, 
        blank=True, 
        related_name='competencias_firmadas',
        verbose_name="Autoridades que Firman",
        help_text="Seleccione quiénes aparecerán al pie de la Convocatoria y Certificados."
    )
    
    def __str__(self): return self.name

class CategoriaCompetencia(models.Model):
    competencia = models.ForeignKey(Competencia, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    costo = models.DecimalField("Costo Categoría", max_digits=10, decimal_places=2, default=0.00)
    class Meta: unique_together = ('competencia', 'categoria')

class Gasto(models.Model):
    competencia = models.ForeignKey(Competencia, on_delete=models.CASCADE, related_name='gastos')
    descripcion = models.CharField(max_length=200)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    registrado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    fecha = models.DateField(auto_now_add=True)
    def __str__(self): return f"{self.descripcion}: {self.monto}"

class Inscripcion(models.Model):
    ESTADO_CHOICES = [('PENDIENTE', 'Pendiente'), ('APROBADA', 'Aprobada'), ('RECHAZADA', 'Rechazada')]
    deportista = models.ForeignKey('deportistas.Deportista', on_delete=models.CASCADE, related_name='inscripciones')
    competencia = models.ForeignKey(Competencia, on_delete=models.CASCADE, related_name='inscripciones')
    club = models.ForeignKey('clubs.Club', on_delete=models.CASCADE, related_name='inscripciones')
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='PENDIENTE')
    
    costo_inscripcion = models.DecimalField("Total a Pagar", max_digits=10, decimal_places=2, default=0.00)
    monto_pagado = models.DecimalField("Monto Pagado", max_digits=10, decimal_places=2, default=0.00)
    observaciones_pago = models.TextField(blank=True, null=True)
    grupo = models.IntegerField(default=1)
    carril = models.IntegerField(default=0)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self): return f"Inscripción {self.id} - {self.deportista}"

    def actualizar_total(self):
        total = Decimal(self.competencia.costo_inscripcion_base)
        for participacion in self.participaciones.all():
            total += participacion.costo_cobrado
        
        limite = self.competencia.costo_limite_global
        if limite is not None and limite > 0:
            if total > limite:
                total = limite
        
        self.costo_inscripcion = total
        self.save()

class Participacion(models.Model):
    inscripcion = models.ForeignKey('Inscripcion', on_delete=models.CASCADE, related_name='participaciones')
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, null=True) 
    modalidad = models.ForeignKey(Modalidad, on_delete=models.CASCADE)
    arma_utilizada = models.ForeignKey('deportistas.Arma', on_delete=models.SET_NULL, null=True, blank=True)
    costo_cobrado = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    class Meta: unique_together = ('inscripcion', 'categoria') 

    def clean(self):
        if not self.inscripcion_id and not hasattr(self, 'inscripcion'): return 
        deportista = self.inscripcion.deportista
        if self.modalidad.es_fuego:
            if deportista.es_menor_edad(): return
            if deportista.tipo_modalidad == 'AIRE':
                raise ValidationError(f"RECHAZADO: {deportista} es 'SOLO AIRE'...")
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class Resultado(models.Model):
    inscripcion = models.ForeignKey('Inscripcion', on_delete=models.CASCADE, related_name='resultados')
    ronda_o_serie = models.CharField(max_length=50) 
    detalles_json = models.JSONField(default=dict)
    puntaje = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    juez_que_registro = models.ForeignKey(Juez, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    es_descalificado = models.BooleanField(default=False)
    motivo_descalificacion = models.CharField(max_length=255, blank=True, null=True)
    codigo_verificacion = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    def __str__(self): return f"Result {self.puntaje}"

class Record(models.Model):
    modalidad = models.ForeignKey(Modalidad, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    deportista = models.ForeignKey('deportistas.Deportista', on_delete=models.CASCADE)
    competencia = models.ForeignKey(Competencia, on_delete=models.CASCADE)
    puntaje = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_registro = models.DateField()
    es_actual = models.BooleanField(default=True)
    antecesor = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)

class CompetenciaJuez(models.Model):
    competencia = models.ForeignKey(Competencia, on_delete=models.CASCADE)
    juez = models.ForeignKey(Juez, on_delete=models.CASCADE)
    class Meta: unique_together = ('competencia', 'juez')
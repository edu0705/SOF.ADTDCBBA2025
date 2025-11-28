from django.db import models
from django.conf import settings
import uuid

# --- MODELOS DE INFRAESTRUCTURA ---

class Poligono(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200, blank=True)
    numero_licencia = models.CharField(max_length=50, blank=True, null=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='poligono_administrado'
    )

    def __str__(self):
        return self.name

class Juez(models.Model):
    full_name = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.full_name} ({self.license_number})"

# --- MODELOS DE COMPETENCIA ---

class Modalidad(models.Model):
    name = models.CharField(max_length=100)
    es_fuego = models.BooleanField(default=True, help_text="Marcar si es arma de fuego. Desmarcar para aire comprimido.")

    def __str__(self):
        return self.name

class Categoria(models.Model):
    name = models.CharField(max_length=100)
    modalidad = models.ForeignKey(Modalidad, on_delete=models.CASCADE, related_name='categorias')
    calibre_permitido = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.name} - {self.modalidad.name}"

class Competencia(models.Model):
    ESTADOS = [
        ('Abierta', 'Abierta'),
        ('En Curso', 'En Curso'),
        ('Finalizada', 'Finalizada'),
        ('Cancelada', 'Cancelada'),
    ]
    TIPOS = [
        ('Nacional', 'Nacional'),
        ('Departamental', 'Departamental'),
        ('Interno', 'Interno'),
    ]

    name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    poligono = models.ForeignKey(Poligono, on_delete=models.SET_NULL, null=True, related_name='competencias')
    status = models.CharField(max_length=20, choices=ESTADOS, default='Abierta')
    type = models.CharField(max_length=20, choices=TIPOS, default='Departamental')
    
    # Configuraciones financieras y de contacto
    costo_inscripcion_base = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    banco_info = models.TextField(blank=True, help_text="Datos bancarios para depósitos")
    contacto_nombre = models.CharField(max_length=100, blank=True)
    contacto_telefono = models.CharField(max_length=20, blank=True)

    # --- CORRECCIÓN E336 AQUÍ ---
    # La relación M2M ahora apunta a 'Categoria', que es lo que tiene la tabla intermedia
    categorias = models.ManyToManyField(
        Categoria, 
        through='CategoriaCompetencia',
        related_name='competencias'
    )
    
    jueces = models.ManyToManyField(Juez, blank=True)

    def __str__(self):
        return f"{self.name} ({self.start_date})"

class CategoriaCompetencia(models.Model):
    """Modelo intermedio para definir costos específicos por categoría en una competencia"""
    competencia = models.ForeignKey(Competencia, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    costo_especifico = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = "Categoría Habilitada"
        verbose_name_plural = "Categorías Habilitadas"

# --- GESTIÓN DE INSCRIPCIONES Y RESULTADOS ---

class Inscripcion(models.Model):
    ESTADOS_PAGO = [
        ('PENDIENTE', 'Pendiente'),
        ('CONFIRMADA', 'Confirmada'),
        ('ANULADA', 'Anulada')
    ]

    competencia = models.ForeignKey(Competencia, on_delete=models.CASCADE, related_name='inscripciones')
    # Usamos string reference para evitar importación circular con la app deportistas
    deportista = models.ForeignKey('deportistas.Deportista', on_delete=models.CASCADE, related_name='inscripciones')
    club = models.ForeignKey('clubs.Club', on_delete=models.SET_NULL, null=True, blank=True)
    
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS_PAGO, default='PENDIENTE')
    
    monto_pagado = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    comprobante_pago = models.FileField(upload_to='comprobantes/', null=True, blank=True)

    class Meta:
        unique_together = ('competencia', 'deportista')
        verbose_name = "Inscripción"
        verbose_name_plural = "Inscripciones"

    def __str__(self):
        return f"{self.deportista} en {self.competencia}"

    @property
    def costo_total(self):
        total = 0
        for part in self.participaciones.all():
            cat_comp = CategoriaCompetencia.objects.filter(
                competencia=self.competencia, 
                categoria=part.categoria
            ).first()
            if cat_comp and cat_comp.costo_especifico:
                total += cat_comp.costo_especifico
            else:
                total += self.competencia.costo_inscripcion_base
        return total

class Participacion(models.Model):
    """Detalle de en qué categorías participa una inscripción"""
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.CASCADE, related_name='participaciones')
    modalidad = models.ForeignKey(Modalidad, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, null=True, blank=True)    
    arma_utilizada = models.ForeignKey('deportistas.Arma', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.categoria} ({self.inscripcion.deportista})"

class Resultado(models.Model):
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.CASCADE, related_name='resultados')
    participacion = models.ForeignKey(Participacion, on_delete=models.CASCADE, null=True)
    
    ronda_o_serie = models.CharField(max_length=50, default="Final")
    puntaje = models.DecimalField(max_digits=10, decimal_places=2)
    detalles_json = models.JSONField(default=dict, blank=True) 
    
    es_descalificado = models.BooleanField(default=False)
    motivo_dq = models.CharField(max_length=200, blank=True)
    
    juez_que_registro = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    fecha_registro = models.DateTimeField(auto_now=True)
    codigo_verificacion = models.CharField(max_length=50, unique=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.codigo_verificacion:
            self.codigo_verificacion = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)

# --- NUEVOS MODELOS PARA REPORTES Y GESTIÓN ---

class Gasto(models.Model):
    competencia = models.ForeignKey(Competencia, on_delete=models.CASCADE, related_name='gastos')
    descripcion = models.CharField(max_length=200)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField(auto_now_add=True)
    registrado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

class Record(models.Model):
    modalidad = models.ForeignKey(Modalidad, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    puntaje = models.DecimalField(max_digits=10, decimal_places=2)
    deportista = models.ForeignKey('deportistas.Deportista', on_delete=models.CASCADE)
    fecha_logro = models.DateField()
    competencia_origen = models.ForeignKey(Competencia, on_delete=models.SET_NULL, null=True)

class AutoridadFirma(models.Model):
    nombre = models.CharField(max_length=100)
    cargo = models.CharField(max_length=100)
    firma = models.ImageField(upload_to='firmas/', help_text="Imagen PNG transparente")
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} ({self.cargo})"
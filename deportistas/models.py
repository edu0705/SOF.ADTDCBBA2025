from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from datetime import date
# Eliminamos dateutil para no requerir instalaciones extra
from clubs.models import Club
from adtdcbba_backend.validators import validate_file_integrity

class Deportista(models.Model):
    STATUS_CHOICES = (('PENDIENTE', 'Pendiente'), ('ACTIVO', 'Activo'), ('SUSPENDIDO', 'Suspendido'), ('INACTIVO', 'Inactivo'))
    
    # CLASIFICACIÓN DEL TIRADOR
    TIPO_MODALIDAD_CHOICES = (
        ('AIRE', 'Solo Aire (Balines/Postones)'),
        ('FUEGO', 'Armas de Fuego'),
        ('MIXTA', 'Mixta (Aire y Fuego)'),
    )
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='deportista')
    first_name = models.CharField("Nombres", max_length=100)
    apellido_paterno = models.CharField("Apellido Paterno", max_length=100)
    apellido_materno = models.CharField("Apellido Materno", max_length=100, blank=True, null=True)
    fecha_nacimiento = models.DateField("Fecha de Nacimiento")
    ci = models.CharField("Cédula de Identidad", max_length=20, unique=True)
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True, related_name='deportistas', verbose_name="Club")
    status = models.CharField("Estado", max_length=20, choices=STATUS_CHOICES, default='PENDIENTE')
    
    # GESTIÓN DE CREDENCIALES
    tipo_modalidad = models.CharField("Categoría de Tiro", max_length=10, choices=TIPO_MODALIDAD_CHOICES, default='AIRE')
    vencimiento_credencial = models.DateField("Vencimiento Credencial", blank=True, null=True, help_text="Calculado automáticamente: Licencia B o 3 años.")
    
    # Datos Administrativos
    codigo_unico = models.CharField("Código Único", max_length=50, unique=True, blank=True, null=True)
    es_invitado = models.BooleanField("Es Invitado", default=False)
    departamento_origen = models.CharField("Dpto. Origen", max_length=50, blank=True, null=True) 
    
    motivo_suspension = models.TextField(blank=True, null=True)
    fecha_suspension = models.DateField(blank=True, null=True)
    suspension_indefinida = models.BooleanField(default=False)
    fin_suspension = models.DateField(blank=True, null=True)
    
    es_historico = models.BooleanField(default=False)
    force_password_change = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    archivo_responsabilidad = models.FileField("Carta de Responsabilidad", upload_to='responsabilidades/', blank=True, null=True, validators=[validate_file_integrity])
    foto = models.ImageField("Foto de Perfil", upload_to='fotos_deportistas/', blank=True, null=True, validators=[validate_file_integrity])

    class Meta:
        verbose_name = "Deportista"
        verbose_name_plural = "Deportistas"
        ordering = ['apellido_paterno', 'apellido_materno', 'first_name']

    def __str__(self):
        full_name = f"{self.first_name} {self.apellido_paterno}"
        if self.apellido_materno:
            full_name += f" {self.apellido_materno}"
        return full_name

    def get_edad(self):
        if not self.fecha_nacimiento: return 0
        today = date.today()
        return today.year - self.fecha_nacimiento.year - ((today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day))
    get_edad.short_description = "Edad"

    def es_menor_edad(self):
        return self.get_edad() < 18

    def actualizar_vencimiento_credencial(self):
        """
        LÓGICA LEGAL DE CREDENCIALES:
        1. Si es Menor de Edad o Modalidad AIRE -> 3 años de vigencia desde hoy.
        2. Si es FUEGO o MIXTA -> Copia la fecha de la Licencia B vigente.
        """
        hoy = date.today()
        
        # CASO 1: Régimen Especial (Niños o Aire)
        if self.es_menor_edad() or self.tipo_modalidad == 'AIRE':
            # Se otorga 3 años desde la fecha actual (o renovación)
            try:
                self.vencimiento_credencial = hoy.replace(year=hoy.year + 3)
            except ValueError:
                # Manejo seguro de años bisiestos (Si hoy es 29 Feb, el vencimiento será 28 Feb)
                self.vencimiento_credencial = hoy.replace(year=hoy.year + 3, month=2, day=28)
        
        # CASO 2: Régimen General (Armas de Fuego)
        else:
            # Buscamos la Licencia B más reciente cargada en el sistema
            licencia = self.documentos.filter(document_type='Licencia B').order_by('-expiration_date').first()
            
            if licencia and licencia.expiration_date and licencia.expiration_date >= hoy:
                self.vencimiento_credencial = licencia.expiration_date
            else:
                # Si no tiene licencia vigente, no actualizamos (o podríamos invalidar)
                pass 

        self.save()

class Arma(models.Model):
    TIPO_CHOICES = (('Corta', 'Arma Corta'), ('Larga', 'Arma Larga'), ('Escopeta', 'Escopeta'))
    deportista = models.ForeignKey(Deportista, on_delete=models.CASCADE, related_name='armas', verbose_name="Propietario")
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    calibre = models.CharField(max_length=50)
    serie = models.CharField(max_length=100, unique=True)
    matricula = models.CharField("Matrícula", max_length=100, blank=True, null=True)
    es_aire_comprimido = models.BooleanField("Es Aire Comprimido", default=False)
    fecha_inspeccion = models.DateField(blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Arma"
        verbose_name_plural = "Armas"

    def __str__(self): return f"{self.marca} {self.modelo} ({self.calibre})"

class DocumentoDeportista(models.Model):
    DOC_TYPES = (('CI', 'Cédula'), ('Licencia B', 'Licencia'), ('Responsabilidad', 'Responsabilidad'), ('Otro', 'Otro'))
    deportista = models.ForeignKey(Deportista, on_delete=models.CASCADE, related_name='documentos')
    document_type = models.CharField("Tipo de Documento", max_length=50, choices=DOC_TYPES)
    file = models.FileField("Archivo", upload_to='docs_deportistas/', validators=[validate_file_integrity])
    expiration_date = models.DateField("Fecha de Vencimiento", blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Documento"
        verbose_name_plural = "Documentos"

    def __str__(self): return f"{self.get_document_type_display()} - {self.deportista}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # AUTOMATIZACIÓN: Si suben una Licencia B, actualizamos el credencial del deportista
        if self.document_type == 'Licencia B':
            self.deportista.actualizar_vencimiento_credencial()

class PrestamoArma(models.Model):
    arma = models.ForeignKey(Arma, on_delete=models.CASCADE)
    deportista_propietario = models.ForeignKey(Deportista, on_delete=models.CASCADE, related_name='prestamos_otorgados')
    deportista_receptor = models.ForeignKey(Deportista, on_delete=models.CASCADE, related_name='prestamos_recibidos')
    competencia = models.ForeignKey('competencias.Competencia', on_delete=models.CASCADE)
    fecha_prestamo = models.DateField(auto_now_add=True)
    observaciones = models.TextField(blank=True, null=True)
    
    class Meta: 
        unique_together = ('arma', 'competencia', 'deportista_receptor')
        verbose_name = "Préstamo de Arma"
        verbose_name_plural = "Préstamos de Armas"
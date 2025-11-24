# deportistas/models.py
from django.db import models
from django.contrib.auth.models import User
from clubs.models import Club

class Deportista(models.Model):
    STATUS_CHOICES = (
        ('PENDIENTE', 'Pendiente de Validación'), # Creado por Club, espera aprobación Admin
        ('ACTIVO', 'Activo'),                     # Habilitado para competir
        ('SUSPENDIDO', 'Suspendido'),             # Sancionado (no puede competir)
        ('INACTIVO', 'Inactivo/Baja'),            # Dejó el club o el deporte
    )

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='deportista')
    
    # Datos Personales
    first_name = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100, blank=True, null=True)
    fecha_nacimiento = models.DateField()
    ci = models.CharField(max_length=20, unique=True, verbose_name="Cédula de Identidad")
    
    # Club al que representa ACTUALMENTE
    # Si es Null, significa que está "Sin Club" y no puede competir hasta asignarse uno.
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True, related_name='deportistas')
    
    # Gestión Deportiva
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDIENTE')
    codigo_unico = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
    # Invitados y Origen
    es_invitado = models.BooleanField(default=False)
    departamento_origen = models.CharField(max_length=50, blank=True, null=True) 
    
    # Control de Suspensiones (NUEVO)
    motivo_suspension = models.TextField(blank=True, null=True, help_text="Razón de la sanción si está suspendido")
    fecha_suspension = models.DateField(blank=True, null=True)
    suspension_indefinida = models.BooleanField(default=False)
    fin_suspension = models.DateField(blank=True, null=True, help_text="Dejar vacío si es indefinida")
    
    # Datos Históricos y Sistema
    es_historico = models.BooleanField(default=False, help_text="Deportista de gestiones pasadas importado")
    force_password_change = models.BooleanField(default=False)
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Documentos (Relación inversa con DocumentoDeportista - se define en otro modelo o con related_name)
    # archivo_responsabilidad: Se puede manejar como un DocumentoDeportista o campo directo si prefieres simplificar
    archivo_responsabilidad = models.FileField(upload_to='responsabilidades/', blank=True, null=True)

    def __str__(self):
        club_name = self.club.name if self.club else "Sin Club"
        return f"{self.first_name} {self.apellido_paterno} ({club_name})"

    def get_edad(self):
        from datetime import date
        today = date.today()
        return today.year - self.fecha_nacimiento.year - ((today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day))


class Arma(models.Model):
    TIPO_CHOICES = (
        ('Corta', 'Arma Corta'),
        ('Larga', 'Arma Larga'),
        ('Escopeta', 'Escopeta'),
    )
    
    deportista = models.ForeignKey(Deportista, on_delete=models.CASCADE, related_name='armas')
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    calibre = models.CharField(max_length=50)
    serie = models.CharField(max_length=100, unique=True)
    matricula = models.CharField(max_length=100, blank=True, null=True)
    
    # Control 2026
    es_aire_comprimido = models.BooleanField(default=False)
    fecha_inspeccion = models.DateField(blank=True, null=True, help_text="Válida por la gestión actual")
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.calibre})"


class DocumentoDeportista(models.Model):
    DOC_TYPES = (
        ('CI', 'Cédula de Identidad'),
        ('Licencia B', 'Licencia Cat. B'),
        ('Responsabilidad', 'Carta de Responsabilidad'),
        ('Otro', 'Otro Documento'),
    )
    deportista = models.ForeignKey(Deportista, on_delete=models.CASCADE, related_name='documentos')
    document_type = models.CharField(max_length=50, choices=DOC_TYPES)
    file = models.FileField(upload_to='docs_deportistas/')
    expiration_date = models.DateField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document_type} - {self.deportista}"


class PrestamoArma(models.Model):
    """
    Registro legal de préstamos de armas para una competencia específica.
    Permite validar que un deportista use un arma que no es suya.
    """
    arma = models.ForeignKey(Arma, on_delete=models.CASCADE)
    deportista_propietario = models.ForeignKey(Deportista, on_delete=models.CASCADE, related_name='prestamos_otorgados')
    deportista_receptor = models.ForeignKey(Deportista, on_delete=models.CASCADE, related_name='prestamos_recibidos')
    competencia = models.ForeignKey('competencias.Competencia', on_delete=models.CASCADE) # String reference evita circular import
    fecha_prestamo = models.DateField(auto_now_add=True)
    observaciones = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('arma', 'competencia', 'deportista_receptor')

    def __str__(self):
        return f"Préstamo: {self.arma} a {self.deportista_receptor} para {self.competencia}"
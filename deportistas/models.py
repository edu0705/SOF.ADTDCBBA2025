from django.db import models
from django.contrib.auth.models import User
from clubs.models import Club

class Deportista(models.Model):
    STATUS_CHOICES = (
        ('Pendiente de Aprobación', 'Pendiente de Aprobación'),
        ('Activo', 'Activo'),
        ('Suspendido', 'Suspendido'),
        ('Rechazado', 'Rechazado'), # Añadido el estado Rechazado
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True)
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    ci = models.CharField(max_length=20, unique=True)
    birth_date = models.DateField()
    departamento = models.CharField(max_length=50)
    genero = models.CharField(max_length=10)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    foto_path = models.ImageField(upload_to='fotos_deportistas/', blank=True, null=True)
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pendiente de Aprobación')
    
    # CAMPO CORREGIDO: Almacena el motivo de rechazo o notas de suspensión
    notas_admin = models.TextField(null=True, blank=True) 
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Documento(models.Model):
    DOCUMENT_TYPES = (
        ('Licencia B', 'Licencia B (PDF)'),
        ('Carnet de Identidad', 'Carnet de Identidad (PDF)'),
        ('Licencia de Competencia', 'Licencia de Competencia'),
    )
    deportista = models.ForeignKey('Deportista', on_delete=models.CASCADE, related_name='documentos')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    file_path = models.FileField(upload_to='documentos_deportistas/')
    # Permite nulos para el CI
    expiration_date = models.DateField(null=True, blank=True) 
    
    def __str__(self):
        return f"{self.document_type} - {self.deportista.first_name}"

class Arma(models.Model):
    # ... (Modelos Arma son correctos)
    deportista = models.ForeignKey('Deportista', on_delete=models.CASCADE, related_name='armas')
    tipo = models.CharField(max_length=100)
    calibre = models.CharField(max_length=50)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    numero_matricula = models.CharField(max_length=100)
    fecha_inspeccion = models.DateField(null=True, blank=True) # Campo para control de vigencia
    file_path = models.FileField(upload_to='matriculas_armas/')
    
    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.calibre})"
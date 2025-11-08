# clubs/models.py
from django.db import models
from django.contrib.auth.models import User # Importa el modelo User

class Club(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) # Nueva línea
    name = models.CharField(max_length=100, unique=True)
    presidente_club = models.CharField(max_length=100)
    numero_licencia = models.CharField(max_length=50, blank=True, null=True)
    fecha_vencimiento_licencia = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return self.name
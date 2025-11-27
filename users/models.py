from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        JUEZ = 'JUEZ', 'Juez'
        DEPORTISTA = 'DEPORTISTA', 'Deportista'
        CLUB = 'CLUB', 'Representante de Club'

    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.DEPORTISTA)
    ci = models.CharField("Cédula de Identidad", max_length=20, blank=True, null=True)
    phone = models.CharField("Teléfono", max_length=20, blank=True, null=True)
    
    # Relación con Club (String reference para evitar ciclos)
    club = models.ForeignKey('clubs.Club', on_delete=models.SET_NULL, null=True, blank=True, related_name='miembros')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
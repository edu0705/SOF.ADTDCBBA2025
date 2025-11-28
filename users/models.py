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
    
    # Relación con Club
    club = models.ForeignKey('clubs.Club', on_delete=models.SET_NULL, null=True, blank=True, related_name='miembros')

    def save(self, *args, **kwargs):
        """
        Lógica automática de permisos basada en el Rol.
        """
        # Si es Admin o Juez, DEBE tener acceso al panel (is_staff=True)
        if self.role in [self.Roles.ADMIN, self.Roles.JUEZ]:
            self.is_staff = True
        
        # Si es Deportista o Club, NO debería entrar al panel admin (salvo que sea superuser)
        elif not self.is_superuser:
            self.is_staff = False
            
        super().save(*args, **kwargs)

    def __str__(self):
        role_label = self.get_role_display()
        return f"{self.username} | {role_label}"
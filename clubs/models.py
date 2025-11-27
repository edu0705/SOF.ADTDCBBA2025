from django.db import models
from django.conf import settings  # <--- ESTO ES VITAL

class Club(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, # Debe decir esto, NO 'User' a secas
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='club_managed'
    )
    name = models.CharField(max_length=100)
    president_name = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.name
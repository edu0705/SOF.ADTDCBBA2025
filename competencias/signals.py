from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Participacion

@receiver(post_save, sender=Participacion)
@receiver(post_delete, sender=Participacion)
def recalcular_costo_inscripcion(sender, instance, **kwargs):
    """
    Cada vez que se crea, modifica o borra una participación,
    recalculamos el total de la inscripción padre.
    """
    inscripcion = instance.inscripcion
    # Llamamos al método inteligente que creamos en el modelo
    inscripcion.actualizar_total()
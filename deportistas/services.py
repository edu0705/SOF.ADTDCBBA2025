# deportistas/services.py
from datetime import date
from django.core.exceptions import ValidationError
from django.db import transaction, models
from .models import Deportista
# Importamos Inscripcion dentro de los métodos o usamos string para evitar dependencias circulares si fuera necesario,
# pero aquí como es un servicio, lo ideal es importar el modelo directamente.
from competencias.models import Inscripcion

class GestionDeportistaService:
    
    @staticmethod
    def registrar_nuevo_deportista(data, usuario_solicitante):
        """
        Crea un deportista. 
        - Si lo crea un CLUB: Estado 'PENDIENTE' (requiere aprobación).
        - Si lo crea un ADMIN: Estado 'ACTIVO'.
        """
        estado_inicial = 'PENDIENTE'
        # Verificar si es admin o directiva (ajusta según tus nombres de grupos reales)
        if usuario_solicitante.is_staff or usuario_solicitante.groups.filter(name__in=['Presidente', 'Admin']).exists():
            estado_inicial = 'ACTIVO'
        
        # 'data' debe ser un diccionario limpio o validated_data de un serializer
        deportista = Deportista.objects.create(
            status=estado_inicial,
            **data
        )
        return deportista

    @staticmethod
    def transferir_club(deportista, nuevo_club, usuario_admin):
        """
        Transfiere un deportista a un nuevo club.
        REGLA DE ORO: Si ya compitió este año con el club anterior,
        el sistema advierte o bloquea (según configuración estricta).
        """
        year_actual = date.today().year
        
        # Verificamos si tiene participaciones APROBADAS este año
        ha_competido = Inscripcion.objects.filter(
            deportista=deportista,
            competencia__start_date__year=year_actual,
            estado='APROBADA'
        ).exists()

        if ha_competido:
            # Opción A: Solo advertencia (el Admin decide si procede)
            pass 
            # Opción B: Bloqueo estricto (Descomentar para activar)
            # if not usuario_admin.is_superuser:
            #     raise ValidationError(f"El deportista ya compitió en la gestión {year_actual}. El cambio de club está restringido.")

        with transaction.atomic():
            # Actualizamos el club actual.
            # NOTA: Esto NO afecta a las inscripciones pasadas, ya que ellas
            # guardaron una copia del club en el momento de la inscripción.
            deportista.club = nuevo_club
            deportista.save()
            
            # Log de auditoría (opcional)
            print(f"Transferencia: {deportista} movido a {nuevo_club} por {usuario_admin}")

    @staticmethod
    def suspender_deportista(deportista, motivo, fecha_fin=None):
        """
        Suspende al deportista y cancela sus inscripciones futuras pendientes.
        """
        deportista.status = 'SUSPENDIDO'
        deportista.motivo_suspension = motivo
        deportista.fecha_suspension = date.today()
        deportista.fin_suspension = fecha_fin
        deportista.suspension_indefinida = (fecha_fin is None)
        deportista.save()

        # Damos de baja inscripciones futuras que estaban pendientes
        Inscripcion.objects.filter(
            deportista=deportista,
            competencia__start_date__gte=date.today(),
            estado='PENDIENTE'
        ).update(
            estado='RECHAZADA', 
            observaciones_pago=f"Rechazo Automático: Deportista suspendido el {date.today()}. Motivo: {motivo}"
        )

    @staticmethod
    def validar_para_competencia(deportista):
        """
        Valida si un deportista está habilitado para inscribirse.
        """
        if deportista.status == 'SUSPENDIDO':
            msg = f"Deportista suspendido. Motivo: {deportista.motivo_suspension}."
            if deportista.fin_suspension:
                msg += f" Hasta: {deportista.fin_suspension}"
            raise ValidationError(msg)
        
        if deportista.status == 'INACTIVO':
            raise ValidationError("El deportista está marcado como INACTIVO/BAJA.")
            
        if deportista.status == 'PENDIENTE':
            raise ValidationError("El deportista aún está PENDIENTE de validación por la Asociación.")
            
        if not deportista.club and not deportista.es_invitado:
            raise ValidationError("El deportista no tiene un Club asignado. Debe afiliarse para competir.")
            
        return True
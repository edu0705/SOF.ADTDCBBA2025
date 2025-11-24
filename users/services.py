# users/services.py
from datetime import date, timedelta
from django.db.models import Q
from competencias.models import Competencia
from deportistas.models import Deportista, Arma

class NotificationService:
    """
    Servicio encargado de centralizar todas las alertas y notificaciones
    del sistema para los usuarios.
    """
    
    @staticmethod
    def get_user_notifications(user):
        notifications = []
        today = date.today()
        warning_date = today + timedelta(days=90) # Alerta con 3 meses de anticipación

        # --- 1. NOTIFICACIONES GLOBALES (Competencias) ---
        
        # A. Competencias Próximas
        proximas = Competencia.objects.filter(
            status='Próxima', 
            start_date__gte=today
        ).order_by('start_date')
        
        for comp in proximas:
            notifications.append({
                'id': f'new-{comp.id}',
                'type': 'info',
                'title': 'Nueva Competencia',
                'message': f"{comp.name} programada para el {comp.start_date.strftime('%d/%m/%Y')}.",
                'link': '/admin/competencias'
            })
        
        # B. Resultados Recientes (Publicados hace menos de 3 días)
        recent_final = Competencia.objects.filter(
            status='Finalizada', 
            end_date__gte=today - timedelta(days=3)
        )
        
        for comp in recent_final:
            notifications.append({
                'id': f'res-{comp.id}',
                'type': 'success',
                'title': 'Resultados Disponibles',
                'message': f"Ya puedes consultar los resultados de {comp.name}.",
                'link': f'/admin/resultados/{comp.id}'
            })

        # --- 2. NOTIFICACIONES PERSONALES (Deportistas y Clubes) ---
        
        # Detectamos qué deportistas están asociados a este usuario
        deps = []
        if hasattr(user, 'club'):
            # Si es un Club, revisamos a TODOS sus deportistas
            deps = Deportista.objects.filter(club=user.club)
        elif hasattr(user, 'deportista'):
            # Si es un Deportista, se revisa a sí mismo
            deps = [user.deportista]

        for dep in deps:
            # A. Vencimiento de Licencias (Tipo B)
            # Buscamos la licencia más reciente
            licencia = dep.documentos.filter(document_type='Licencia B').order_by('-expiration_date').first()
            
            if licencia and licencia.expiration_date:
                days_left = (licencia.expiration_date - today).days
                
                if days_left < 0:
                    notifications.append({
                        'id': f'lic-exp-{dep.id}',
                        'type': 'danger',
                        'title': 'Licencia Vencida',
                        'message': f"ATENCIÓN: La licencia de {dep.first_name} {dep.apellido_paterno} ha caducado. Debe renovarla para competir en Fuego.",
                        'link': '/mi-perfil'
                    })
                elif days_left <= 90:
                    notifications.append({
                        'id': f'lic-warn-{dep.id}',
                        'type': 'warning',
                        'title': 'Renovación Próxima',
                        'message': f"La licencia de {dep.first_name} vence en {days_left} días ({licencia.expiration_date.strftime('%d/%m')}).",
                        'link': '/mi-perfil'
                    })

            # B. Inspección de Armas (Solo Armas de Fuego)
            armas = Arma.objects.filter(deportista=dep, es_aire_comprimido=False)
            
            for arma in armas:
                if arma.fecha_inspeccion:
                    days_left = (arma.fecha_inspeccion - today).days
                    
                    if days_left < 0:
                        notifications.append({
                            'id': f'arma-exp-{arma.id}',
                            'type': 'danger',
                            'title': 'Inspección Caducada',
                            'message': f"El arma {arma.marca} ({arma.modelo}) requiere inspección inmediata.",
                            'link': '/mi-perfil'
                        })
                    elif days_left <= 90:
                        notifications.append({
                            'id': f'arma-warn-{arma.id}',
                            'type': 'warning',
                            'title': 'Inspección Próxima',
                            'message': f"Inspección para {arma.marca} vence el {arma.fecha_inspeccion.strftime('%d/%m')}.",
                            'link': '/mi-perfil'
                        })

        return notifications
from django.db import transaction
from django.db.models import Sum, Q
from django.core.exceptions import ValidationError
from typing import Dict, Any
from decimal import Decimal
from datetime import date

# Channels
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Modelos
from .models import Competencia, Resultado, Inscripcion, Participacion
from deportistas.models import Arma, Deportista
from .serializers import ResultadoSerializer
from .calculadora_puntajes import CalculadoraPuntajes

class CompetitionService:
    @staticmethod
    def cerrar_competencia(competencia: Competencia, user) -> Competencia:
        if competencia.status == 'Finalizada':
            raise ValidationError("La competencia ya se encuentra finalizada.")
        
        with transaction.atomic():
            competencia.status = 'Finalizada'
            competencia.save()
        return competencia

class ResultsService:
    @staticmethod
    def procesar_envio_puntajes(data: Dict[str, Any], context: Dict[str, Any]) -> Resultado:
        """
        Calcula y guarda puntajes con protección contra duplicados (Idempotencia).
        """
        # 1. Validación
        serializer = ResultadoSerializer(data=data, context=context)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        inscripcion = validated_data['inscripcion']
        series = validated_data.get('series', [])

        # 2. Cálculo
        calculo = CalculadoraPuntajes.calcular_total_competencia(series)
        puntaje_final = calculo['total_puntos']
        
        # 3. Guardado Transaccional + Lógica WS Diferida
        with transaction.atomic():
            detalles = {
                'series': series,
                'x_count': calculo['total_x'],
                'meta': 'Calculado via ResultsService v2'
            }
            
            # IDEMPOTENCIA: Si ya existe un resultado para esta inscripción, lo actualizamos
            resultado, created = Resultado.objects.update_or_create(
                inscripcion=inscripcion,
                defaults={
                    'puntaje': puntaje_final,
                    'detalles_json': detalles
                }
            )
            
            # 4. Preparar notificación WebSocket (Para ejecutar post-commit)
            channel_layer = get_channel_layer()
            group_name = f"competencia_{inscripcion.competencia.id}"
            
            deportista = inscripcion.deportista
            nombre_dep = f"{deportista.first_name} {deportista.apellido_paterno}"
            
            payload = {
                "type": "update_score",
                "data": {
                    "id": resultado.id,
                    "deportista": nombre_dep,
                    "club": inscripcion.club.name if inscripcion.club else "Sin Club",
                    "puntaje_total": str(resultado.puntaje),
                    "x_count": calculo['total_x'],
                    "is_update": not created
                }
            }
            
            # Enviamos el mensaje SOLO si la transacción se confirma exitosamente
            transaction.on_commit(
                lambda: async_to_sync(channel_layer.group_send)(group_name, payload)
            )

        return resultado

    @staticmethod
    def get_official_results_data(competencia: Competencia) -> Dict[str, Any]:
        resultados = Resultado.objects.filter(
            inscripcion__competencia=competencia
        ).select_related('inscripcion__deportista', 'inscripcion__club').order_by('-puntaje')
        
        return {
            "competencia": competencia.name,
            "total_participantes": resultados.count(),
            "resultados": ResultadoSerializer(resultados, many=True).data
        }

# ... (Mantén las clases RankingService y ReportService igual que antes, son seguras)
class RankingService:
    @staticmethod
    def get_ranking_competencia_pdf(competencia: Competencia) -> Dict[str, Any]:
        resultados = Resultado.objects.filter(inscripcion__competencia=competencia).order_by('-puntaje')
        return {
            "titulo": f"Ranking - {competencia.name}",
            "items": resultados
        }

class ReportService:
    @staticmethod
    def get_poligono_report(poligono_user, year: int = None) -> Dict[str, Any]:
        if not year: year = date.today().year
        competencias = Competencia.objects.filter(poligono__user=poligono_user, start_date__year=year).order_by('-start_date')
        total_ingresos = Inscripcion.objects.filter(competencia__in=competencias).aggregate(total=Sum('monto_pagado'))['total'] or 0
        armas_count = Participacion.objects.filter(inscripcion__competencia__in=competencias).exclude(arma_utilizada__isnull=True).count()
        
        nombre_poligono = "N/A"
        if hasattr(poligono_user, 'poligono_administrado') and poligono_user.poligono_administrado:
            nombre_poligono = poligono_user.poligono_administrado.name

        return {
            "poligono": nombre_poligono, "anio": year,
            "stats": {
                "total_competencias": competencias.count(),
                "total_inscritos": Inscripcion.objects.filter(competencia__in=competencias).count(),
                "ingresos_generados": total_ingresos, "armas_utilizadas": armas_count 
            },
            "detalle_competencias": list(competencias.values('id', 'name', 'start_date', 'status'))
        }

    @staticmethod
    def get_reafuc_arma_traceability(matricula: str) -> Dict[str, Any]:
        arma = Arma.objects.filter(matricula=matricula).select_related('deportista').first()
        if not arma: return None
        uso_historial = []
        participaciones = Participacion.objects.filter(arma_utilizada=arma).select_related(
            'inscripcion__competencia', 'inscripcion__competencia__poligono', 'inscripcion__deportista', 'modalidad'
        ).order_by('-inscripcion__competencia__start_date')

        for part in participaciones:
            comp = part.inscripcion.competencia
            dep = part.inscripcion.deportista
            nombre_poligono = comp.poligono.name if comp.poligono else "N/A"
            uso_historial.append({
                "fecha": comp.start_date, "competencia": comp.name, "poligono": nombre_poligono,
                "usuario_arma": f"{dep.first_name} {dep.apellido_paterno}", "modalidad": part.modalidad.name
            })

        return {
            "arma": f"{arma.marca} {arma.modelo}", "calibre": arma.calibre, "matricula": arma.matricula,
            "propietario_actual": f"{arma.deportista.first_name} {arma.deportista.apellido_paterno}",
            "total_usos_registrados": len(uso_historial), "historial": uso_historial
        }

    @staticmethod
    def get_reafuc_deportista_kardex(busqueda: str) -> Dict[str, Any]:
        deportista = Deportista.objects.filter(Q(ci=busqueda) | Q(codigo_unico=busqueda)).select_related('club').first()
        if not deportista: return None
        inscripciones = Inscripcion.objects.filter(deportista=deportista).select_related('competencia').order_by('-competencia__start_date')
        historial_list = []
        for i in inscripciones:
            mod_names = list(i.participaciones.values_list('modalidad__name', flat=True))
            historial_list.append({
                "fecha": i.competencia.start_date, "competencia": i.competencia.name,
                "estado_inscripcion": i.estado, "modalidades": mod_names
            })
        nombre_club = deportista.club.name if deportista.club else "Sin Club"
        return {
            "nombre": f"{deportista.first_name} {deportista.apellido_paterno}", "ci": deportista.ci,
            "club": nombre_club, "status": deportista.status, "total_competencias": inscripciones.count(),
            "historial": historial_list
        }

    @staticmethod
    def get_quarterly_report(year: int, quarter: int) -> Dict[str, Any]:
        quarters = {1: [1, 2, 3], 2: [4, 5, 6], 3: [7, 8, 9], 4: [10, 11, 12]}
        months = quarters.get(quarter, [])
        competencias = Competencia.objects.filter(start_date__year=year, start_date__month__in=months)
        total_ingresos = Inscripcion.objects.filter(competencia__in=competencias).aggregate(total=Sum('monto_pagado'))['total'] or 0
        total_gastos = 0 
        return {
            "periodo": f"Trimestre {quarter} - {year}", "competencias_realizadas": competencias.count(),
            "resumen_financiero": { "ingresos_brutos": total_ingresos, "gastos_registrados": total_gastos, "balance_neto": total_ingresos - total_gastos },
            "actividad": list(competencias.values('name', 'start_date', 'status', 'type'))
        }
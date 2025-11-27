from django.db import transaction
from django.db.models import Sum, Count, Q
from django.core.exceptions import ValidationError
from typing import Dict, Any, List
from decimal import Decimal
from datetime import date

# --- IMPORTS PARA WEBSOCKETS ---
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# --- IMPORTS DE MODELOS ---
from .models import Competencia, Resultado, Inscripcion, Participacion
from deportistas.models import Arma, Deportista
from .serializers import ResultadoSerializer
from .calculadora_puntajes import CalculadoraPuntajes

class CompetitionService:
    """Lógica de negocio relacionada con el ciclo de vida de la competencia."""
    
    @staticmethod
    def cerrar_competencia(competencia: Competencia, user) -> Competencia:
        if competencia.status == 'Finalizada':
            raise ValidationError("La competencia ya se encuentra finalizada.")
        
        with transaction.atomic():
            competencia.status = 'Finalizada'
            competencia.save()
        
        return competencia

class ResultsService:
    """Lógica de negocio para procesamiento de resultados y rankings."""

    @staticmethod
    def procesar_envio_puntajes(data: Dict[str, Any], context: Dict[str, Any]) -> Resultado:
        """
        Valida, calcula, guarda y NOTIFICA los puntajes enviados.
        """
        # 1. Validación de Datos
        serializer = ResultadoSerializer(data=data, context=context)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        series = validated_data.get('series', [])
        
        # 2. Cálculo Matemático (Usando el Motor Puro)
        calculo = CalculadoraPuntajes.calcular_total_competencia(series)
        
        # 3. Guardado Transaccional
        with transaction.atomic():
            # Adaptado a tu modelo real: 'puntaje' y 'detalles_json'
            detalles = {
                'series': series,
                'x_count': calculo['total_x'],
                'meta': 'Calculado via ResultsService'
            }
            
            resultado = serializer.save(
                puntaje=Decimal(str(calculo['total_puntos'])),
                detalles_json=detalles
            )
            
            # 4. NOTIFICACIÓN EN TIEMPO REAL (WebSocket)
            try:
                channel_layer = get_channel_layer()
                competencia_id = resultado.inscripcion.competencia.id
                group_name = f"competencia_{competencia_id}"
                
                deportista = resultado.inscripcion.deportista
                nombre_dep = f"{deportista.first_name} {deportista.apellido_paterno}"
                
                # Payload para el Frontend
                update_data = {
                    "type": "update_score",
                    "data": {
                        "id": resultado.id,
                        "deportista": nombre_dep,
                        "club": resultado.inscripcion.club.name,
                        "puntaje_total": str(resultado.puntaje),
                        "x_count": calculo['total_x'],
                        "series": series
                    }
                }
                
                print(f"📡 Enviando actualización WS al grupo: {group_name}")
                async_to_sync(channel_layer.group_send)(group_name, update_data)
                
            except Exception as e:
                print(f"⚠️ Error enviando WebSocket: {str(e)}")
            
        return resultado

    @staticmethod
    def get_official_results_data(competencia: Competencia) -> Dict[str, Any]:
        """Obtiene la data cruda para reportes oficiales."""
        resultados = Resultado.objects.filter(
            inscripcion__competencia=competencia
        ).select_related('inscripcion__deportista', 'inscripcion__club').order_by('-puntaje')
        
        return {
            "competencia": competencia.name,
            "total_participantes": resultados.count(),
            "resultados": ResultadoSerializer(resultados, many=True).data
        }

class RankingService:
    """Servicio especializado en generación de Rankings."""
    
    @staticmethod
    def get_ranking_competencia_pdf(competencia: Competencia) -> Dict[str, Any]:
        resultados = Resultado.objects.filter(inscripcion__competencia=competencia).order_by('-puntaje')
        return {
            "titulo": f"Ranking - {competencia.name}",
            "items": resultados
        }

class ReportService:
    """
    Servicio centralizado para inteligencia de negocios y reportes regulatorios (REAFUC).
    """

    @staticmethod
    def get_poligono_report(poligono_user, year: int = None) -> Dict[str, Any]:
        """
        Genera el reporte operativo para el administrador de un polígono.
        """
        if not year:
            year = date.today().year

        # Filtrar competencias en este polígono
        competencias = Competencia.objects.filter(
            poligono__user=poligono_user,
            start_date__year=year
        ).order_by('-start_date')

        # Estadísticas Financieras
        total_ingresos = Inscripcion.objects.filter(competencia__in=competencias).aggregate(
            total=Sum('monto_pagado')
        )['total'] or 0

        # [MEJORA LÓGICA]: Contamos Participaciones con arma, no solo resultados (series)
        # Esto refleja mejor "cuántas armas pasaron por la línea de fuego"
        armas_count = Participacion.objects.filter(
            inscripcion__competencia__in=competencias
        ).exclude(arma_utilizada__isnull=True).count()

        nombre_poligono = "N/A"
        if hasattr(poligono_user, 'poligono_administrado') and poligono_user.poligono_administrado:
            nombre_poligono = poligono_user.poligono_administrado.name

        return {
            "poligono": nombre_poligono,
            "anio": year,
            "stats": {
                "total_competencias": competencias.count(),
                "total_inscritos": Inscripcion.objects.filter(competencia__in=competencias).count(),
                "ingresos_generados": total_ingresos,
                "armas_utilizadas": armas_count 
            },
            "detalle_competencias": list(competencias.values('id', 'name', 'start_date', 'status'))
        }

    @staticmethod
    def get_reafuc_arma_traceability(matricula: str) -> Dict[str, Any]:
        """
        REAFUC: Trazabilidad completa de un arma por matrícula.
        """
        arma = Arma.objects.filter(matricula=matricula).select_related('deportista').first()
        if not arma:
            return None

        # Historial de uso
        uso_historial = []
        participaciones = Participacion.objects.filter(arma_utilizada=arma).select_related(
            'inscripcion__competencia', 
            'inscripcion__competencia__poligono',
            'inscripcion__deportista',
            'modalidad'
        ).order_by('-inscripcion__competencia__start_date')

        for part in participaciones:
            comp = part.inscripcion.competencia
            dep = part.inscripcion.deportista
            nombre_poligono = comp.poligono.name if comp.poligono else "N/A"
            
            uso_historial.append({
                "fecha": comp.start_date,
                "competencia": comp.name,
                "poligono": nombre_poligono,
                "usuario_arma": f"{dep.first_name} {dep.apellido_paterno}",
                "modalidad": part.modalidad.name
            })

        return {
            "arma": f"{arma.marca} {arma.modelo}",
            "calibre": arma.calibre,
            "matricula": arma.matricula,
            "propietario_actual": f"{arma.deportista.first_name} {arma.deportista.apellido_paterno}",
            "total_usos_registrados": len(uso_historial),
            "historial": uso_historial
        }

    @staticmethod
    def get_reafuc_deportista_kardex(busqueda: str) -> Dict[str, Any]:
        """
        REAFUC: Kardex del deportista (Busqueda por CI o Código Único).
        """
        deportista = Deportista.objects.filter(
            Q(ci=busqueda) | Q(codigo_unico=busqueda)
        ).select_related('club').first()
        
        if not deportista:
            return None

        inscripciones = Inscripcion.objects.filter(deportista=deportista).select_related('competencia').order_by('-competencia__start_date')
        
        # Construcción de lista explícita para evitar errores de sintaxis
        historial_list = []
        for i in inscripciones:
            mod_names = list(i.participaciones.values_list('modalidad__name', flat=True))
            historial_list.append({
                "fecha": i.competencia.start_date,
                "competencia": i.competencia.name,
                "estado_inscripcion": i.estado,
                "modalidades": mod_names
            })

        nombre_club = deportista.club.name if deportista.club else "Sin Club"

        return {
            "nombre": f"{deportista.first_name} {deportista.apellido_paterno}",
            "ci": deportista.ci,
            "club": nombre_club,
            "status": deportista.status,
            "total_competencias": inscripciones.count(),
            "historial": historial_list
        }

    @staticmethod
    def get_quarterly_report(year: int, quarter: int) -> Dict[str, Any]:
        """
        Reporte Ejecutivo Trimestral para la Asociación.
        """
        # Definir rango de meses
        quarters = {
            1: [1, 2, 3],
            2: [4, 5, 6],
            3: [7, 8, 9],
            4: [10, 11, 12]
        }
        months = quarters.get(quarter, [])

        competencias = Competencia.objects.filter(
            start_date__year=year,
            start_date__month__in=months
        )

        # Totales financieros
        total_ingresos = Inscripcion.objects.filter(competencia__in=competencias).aggregate(
            total=Sum('monto_pagado')
        )['total'] or 0
        
        total_gastos = 0 

        return {
            "periodo": f"Trimestre {quarter} - {year}",
            "competencias_realizadas": competencias.count(),
            "resumen_financiero": {
                "ingresos_brutos": total_ingresos,
                "gastos_registrados": total_gastos,
                "balance_neto": total_ingresos - total_gastos
            },
            "actividad": list(competencias.values('name', 'start_date', 'status', 'type'))
        }
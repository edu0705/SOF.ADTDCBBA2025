from decimal import Decimal, InvalidOperation
from typing import List, Dict, Any, TypedDict
import logging

logger = logging.getLogger(__name__)

class SerieDict(TypedDict, total=False):
    pajaros: Any
    chanchos: Any
    pavas: Any
    carneros: Any
    impactos_5: Any
    impactos_4: Any
    impactos_3: Any
    impactos_2: Any
    puntaje: Any
    es_x: bool

class CalculadoraPuntajes:
    """
    Motor de dominio para cálculos de precisión de alta fidelidad.
    """

    # Multiplicadores Siluetas
    FACTOR_SILUETAS = {
        'pajaros': Decimal('1.0'),
        'chanchos': Decimal('1.5'),
        'pavas': Decimal('2.0'),
        'carneros': Decimal('2.5')
    }

    # Multiplicadores FBI/Policial
    FACTOR_FBI = {
        'impactos_5': Decimal('5'),
        'impactos_4': Decimal('4'),
        'impactos_3': Decimal('3'),
        'impactos_2': Decimal('2')
    }

    @staticmethod
    def _to_decimal(valor: Any) -> Decimal:
        """Convierte inputs a Decimal de forma segura."""
        if valor is None:
            return Decimal('0.0')
        try:
            return Decimal(str(valor))
        except (InvalidOperation, ValueError, TypeError):
            logger.error(f"Error de conversión Decimal con valor: {valor}")
            return Decimal('0.0')

    @classmethod
    def calcular_total_competencia(cls, series: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_puntos = Decimal('0.0')
        total_x = 0

        for serie in series:
            puntaje_serie = Decimal('0.0')
            
            # Estrategia 1: Siluetas Metálicas
            if any(k in serie for k in cls.FACTOR_SILUETAS.keys()):
                for key, factor in cls.FACTOR_SILUETAS.items():
                    val = cls._to_decimal(serie.get(key))
                    puntaje_serie += val * factor

            # Estrategia 2: FBI / Policial
            elif any(k in serie for k in cls.FACTOR_FBI.keys()):
                for key, factor in cls.FACTOR_FBI.items():
                    val = cls._to_decimal(serie.get(key))
                    puntaje_serie += val * factor

            # Estrategia 3: Puntaje Directo (Fallback)
            else:
                raw_score = serie.get('puntaje', serie.get('puntaje_total_ronda', 0))
                puntaje_serie = cls._to_decimal(raw_score)

            total_puntos += puntaje_serie
            
            if serie.get('es_x', False):
                total_x += 1

        return {
            'total_puntos': total_puntos, # Mantenemos Decimal
            'total_x': total_x,
            'detalle_precision': str(total_puntos)
        }
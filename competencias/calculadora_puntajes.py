from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import List, Dict, Any, TypedDict, Optional
import logging

logger = logging.getLogger(__name__)

class SerieDict(TypedDict, total=False):
    """Definición de tipo para una serie/ronda de disparos"""
    pajaros: Any
    chanchos: Any
    pavas: Any
    carneros: Any
    impactos_5: Any
    impactos_4: Any
    impactos_3: Any
    impactos_2: Any
    puntaje: Any
    puntaje_total_ronda: Any
    es_x: bool

class CalculadoraPuntajes:
    """
    Motor de dominio puro para cálculos de precisión.
    Usa Decimal estrictamente para evitar errores de punto flotante IEEE 754.
    """

    # Multiplicadores constantes (Siluetas)
    FACTOR_PAJAROS = Decimal('1.0')
    FACTOR_CHANCHOS = Decimal('1.5')
    FACTOR_PAVAS = Decimal('2.0')
    FACTOR_CARNEROS = Decimal('2.5')

    # Multiplicadores constantes (FBI/Policial)
    FACTOR_IMP_5 = Decimal('5')
    FACTOR_IMP_4 = Decimal('4')
    FACTOR_IMP_3 = Decimal('3')
    FACTOR_IMP_2 = Decimal('2')

    @staticmethod
    def _to_decimal(valor: Any, default: str = '0.0') -> Decimal:
        """Convierte inputs seguros a Decimal."""
        if valor is None:
            return Decimal(default)
        try:
            return Decimal(str(valor))
        except (InvalidOperation, ValueError, TypeError):
            logger.warning(f"Valor inválido para conversión Decimal: {valor}")
            return Decimal(default)

    @classmethod
    def validar_puntaje(cls, puntaje: Any, maximo: float = 100.0) -> bool:
        """Verifica si un puntaje está dentro del rango permitido."""
        try:
            p = cls._to_decimal(puntaje)
            max_d = cls._to_decimal(maximo)
            return Decimal('0') <= p <= max_d
        except Exception:
            return False

    @classmethod
    def calcular_total_competencia(cls, series: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calcula el puntaje total basado en la lista de series.
        Detecta automáticamente la modalidad (Estrategia implícita).
        """
        total_puntos = Decimal('0.0')
        total_x = 0

        for serie in series:
            puntaje_serie = Decimal('0.0')
            
            # 1. Estrategia: Siluetas Metálicas
            if any(k in serie for k in ['pajaros', 'chanchos', 'pavas', 'carneros']):
                pajaros = cls._to_decimal(serie.get('pajaros'))
                chanchos = cls._to_decimal(serie.get('chanchos'))
                pavas = cls._to_decimal(serie.get('pavas'))
                carneros = cls._to_decimal(serie.get('carneros'))

                puntaje_serie = (
                    (pajaros * cls.FACTOR_PAJAROS) +
                    (chanchos * cls.FACTOR_CHANCHOS) +
                    (pavas * cls.FACTOR_PAVAS) +
                    (carneros * cls.FACTOR_CARNEROS)
                )

            # 2. Estrategia: FBI / Blanco Policial
            elif 'impactos_5' in serie:
                imp_5 = cls._to_decimal(serie.get('impactos_5'))
                imp_4 = cls._to_decimal(serie.get('impactos_4'))
                imp_3 = cls._to_decimal(serie.get('impactos_3'))
                imp_2 = cls._to_decimal(serie.get('impactos_2'))

                puntaje_serie = (
                    (imp_5 * cls.FACTOR_IMP_5) +
                    (imp_4 * cls.FACTOR_IMP_4) +
                    (imp_3 * cls.FACTOR_IMP_3) +
                    (imp_2 * cls.FACTOR_IMP_2)
                )

            # 3. Estrategia: Puntaje Directo (Fallback)
            else:
                raw_score = serie.get('puntaje', serie.get('puntaje_total_ronda'))
                puntaje_serie = cls._to_decimal(raw_score)

            # Acumuladores
            total_puntos += puntaje_serie
            
            if serie.get('es_x', False):
                total_x += 1

        return {
            'total_puntos': float(total_puntos), # Convertimos a float solo al final para JSON
            'total_x': total_x,
            'detalle_precision': str(total_puntos) # Guardamos string exacto por auditoría
        }
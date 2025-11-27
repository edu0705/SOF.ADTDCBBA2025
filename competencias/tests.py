from django.test import TestCase
from .calculadora_puntajes import CalculadoraPuntajes

class CalculadoraPuntajesTestCase(TestCase):
    
    def test_calcular_silueta_metalica(self):
        """
        Prueba el cálculo unificado para Silueta Metálica.
        """
        print("Ejecutando prueba: Silueta Metálica (Clase)")
        # Simulamos la estructura de datos que envía el Frontend
        series = [{
            'pajaros': 10,  # 10 pts
            'chanchos': 10, # 15 pts
            'pavas': 10,    # 20 pts
            'carneros': 10  # 25 pts
        }]
        # Total esperado: 70
        resultado = CalculadoraPuntajes.calcular_total_competencia(series)
        self.assertEqual(resultado['total_puntos'], 70.0)

    def test_calcular_fbi(self):
        """
        Prueba el cálculo para FBI.
        """
        print("Ejecutando prueba: FBI (Clase)")
        series = [{
            'impactos_5': 5, # 25 pts
            'impactos_4': 2, # 8 pts
            'impactos_3': 1, # 3 pts
            'impactos_2': 0 
        }]
        # Total esperado: 36
        resultado = CalculadoraPuntajes.calcular_total_competencia(series)
        self.assertEqual(resultado['total_puntos'], 36.0)

    def test_calcular_puntaje_directo(self):
        """
        Prueba para modalidades simples (Escopeta, etc).
        """
        print("Ejecutando prueba: Puntaje Directo")
        series = [
            {'puntaje': 24, 'es_x': False},
            {'puntaje': 23, 'es_x': True} # Supongamos una segunda serie
        ]
        # Total esperado: 47
        resultado = CalculadoraPuntajes.calcular_total_competencia(series)
        self.assertEqual(resultado['total_puntos'], 47.0)
        self.assertEqual(resultado['total_x'], 1)

    def test_validacion_puntajes(self):
        """
        Prueba el método estático de validación.
        """
        self.assertTrue(CalculadoraPuntajes.validar_puntaje(50))
        self.assertTrue(CalculadoraPuntajes.validar_puntaje(0))
        self.assertFalse(CalculadoraPuntajes.validar_puntaje(101)) # Fuera de rango
        self.assertFalse(CalculadoraPuntajes.validar_puntaje(-1))  # Negativo
        self.assertFalse(CalculadoraPuntajes.validar_puntaje("texto")) # Inválido
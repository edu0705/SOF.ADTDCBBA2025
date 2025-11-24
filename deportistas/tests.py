from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from datetime import date

from clubs.models import Club
from .models import Deportista
from .services import GestionDeportistaService

class ReglasNegocioDeportistaTest(TestCase):
    
    def setUp(self):
        # 1. Usuario dummy para el Club
        self.user_club = User.objects.create_user(username='club_test', password='password123')

        # 2. Club con su usuario
        self.club_alpha = Club.objects.create(
            user=self.user_club,
            name="Club Alpha", 
            presidente_club="Presidente Test"
        )
        
        # 3. Deportista base
        self.deportista = Deportista.objects.create(
            first_name="Juan",
            apellido_paterno="Perez",
            fecha_nacimiento=date(1990, 1, 1),
            ci="1234567",
            club=self.club_alpha,
            status='ACTIVO'
        )

    def test_deportista_activo_pasa_validacion(self):
        try:
            GestionDeportistaService.validar_para_competencia(self.deportista)
        except ValidationError:
            self.fail("GestionDeportistaService lanzó error para un deportista válido.")

    def test_deportista_suspendido_es_rechazado(self):
        self.deportista.status = 'SUSPENDIDO'
        self.deportista.motivo_suspension = "Comportamiento antideportivo"
        self.deportista.save()

        with self.assertRaises(ValidationError) as context:
            GestionDeportistaService.validar_para_competencia(self.deportista)
        
        # Usamos .lower() para evitar errores de mayúsculas/minúsculas en el futuro
        self.assertIn("suspendido", str(context.exception).lower())

    def test_deportista_sin_club_es_rechazado(self):
        self.deportista.club = None
        self.deportista.save()

        with self.assertRaises(ValidationError) as context:
            GestionDeportistaService.validar_para_competencia(self.deportista)
            
        # CORRECCIÓN: Ajustamos el texto exacto o usamos lower()
        self.assertIn("no tiene un club", str(context.exception).lower())

    def test_deportista_pendiente_es_rechazado(self):
        self.deportista.status = 'PENDIENTE'
        self.deportista.save()

        with self.assertRaises(ValidationError) as context:
            GestionDeportistaService.validar_para_competencia(self.deportista)
            
        self.assertIn("pendiente", str(context.exception).lower())

    def test_servicio_suspension_funciona(self):
        GestionDeportistaService.suspender_deportista(
            self.deportista, 
            motivo="Sanción Disciplinaria"
        )
        self.deportista.refresh_from_db()
        
        self.assertEqual(self.deportista.status, 'SUSPENDIDO')
        self.assertEqual(self.deportista.motivo_suspension, "Sanción Disciplinaria")
        self.assertEqual(self.deportista.fecha_suspension, date.today())
from django.apps import AppConfig

class CompetenciasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'competencias'

    def ready(self):
        # Importar señales cuando la app arranca
        import competencias.signals
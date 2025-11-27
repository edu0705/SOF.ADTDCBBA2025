import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adtdcbba_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from clubs.models import Club
from deportistas.models import Deportista

User = get_user_model()

def crear_datos_prueba():
    print("🚀 Iniciando creación de datos...")

    # 1. Grupos
    for nombre in ['Presidente', 'Tesorero', 'Club', 'Juez', 'Deportista']:
        Group.objects.get_or_create(name=nombre)

    # 2. Usuario Club
    club_user, created = User.objects.get_or_create(
        username='club_user',
        defaults={'email': 'club@test.com', 'role': 'CLUB', 'club': None}
    )
    if created:
        club_user.set_password('club123')
        club_user.save()
        club_user.groups.add(Group.objects.get(name='Club'))

    # 3. Club (Usando user_id explícito)
    # ESTA ES LA LÍNEA QUE CORRIGE EL ERROR
    club, created = Club.objects.get_or_create(
        name="Club Tiro Cochabamba",
        defaults={'user_id': club_user.id} 
    )
    
    # 4. Vincular al revés
    if club_user.club != club:
        club_user.club = club
        club_user.save()

    # 5. Otros Usuarios
    users_data = [
        ('admin_pdte', 'admin123', 'ADMIN', 'Presidente'),
        ('tesorero', 'tesorero123', 'ADMIN', 'Tesorero'),
        ('juez_user', 'juez123', 'JUEZ', 'Juez'),
        ('deportista1', 'depor123', 'DEPORTISTA', 'Deportista'),
    ]

    for uname, pw, role, grp in users_data:
        if not User.objects.filter(username=uname).exists():
            u = User.objects.create_user(uname, f"{uname}@t.com", pw, role=role, club=club)
            u.groups.add(Group.objects.get(name=grp))
            
            if role == 'DEPORTISTA':
                Deportista.objects.get_or_create(
                    ci="1234567",
                    defaults={
                        'user': u, 'first_name': 'Juan', 'apellido_paterno': 'Tirador',
                        'fecha_nacimiento': '1990-01-01', 'club': club
                    }
                )

    print("\n✨ ¡DATOS CREADOS EXITOSAMENTE!")

if __name__ == '__main__':
    crear_datos_prueba()
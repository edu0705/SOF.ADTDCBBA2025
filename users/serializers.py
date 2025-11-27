from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    club_nombre = serializers.CharField(source='club.name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display', 'club', 'club_nombre', 'ci', 'phone')
        read_only_fields = ('role', 'club') # Por seguridad, el rol no se edita por API directa
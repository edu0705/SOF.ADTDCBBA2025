# users/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User, Group
from clubs.models import Club

# ... (Tus serializadores existentes)

class UserInfoSerializer(serializers.ModelSerializer):
  groups = serializers.SlugRelatedField(
      many=True,
      read_only=True,
      slug_field='name'
  )
  class Meta:
      model = User
      fields = ['id', 'username', 'email', 'groups']
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Business

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    business_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def create(self, validated):
        business = Business.objects.create(name=validated["business_name"])
        user = User.objects.create_user(
            username=validated["email"],
            email=validated["email"],
            password=validated["password"],
            business=business,
            role="admin",
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source="business.name", read_only=True)
    class Meta:
        model = User
        fields = ["id", "email", "role", "business_name"]
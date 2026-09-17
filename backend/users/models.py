from django.db import models
from django.contrib.auth.models import AbstractUser

class Business(models.Model):
    name = models.CharField(max_length=255)
    plan = models.CharField(max_length=50, default="free")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = [("admin", "Admin"), ("staff", "Staff"), ("viewer", "Viewer")]
    business = models.ForeignKey(Business, on_delete=models.CASCADE, null=True, blank=True, related_name="users")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="viewer")

    def __str__(self):
        return self.email or self.username
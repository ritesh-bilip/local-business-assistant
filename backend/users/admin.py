from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Business

@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "plan", "created_at")

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("id", "username", "email", "role", "business", "is_staff")
    list_filter = ("role", "business", "is_staff")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Business", {"fields": ("business", "role")}),
    )
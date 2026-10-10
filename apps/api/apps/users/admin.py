from django.contrib import admin

from .models import StaffUser, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['phone', 'name', 'status', 'marketing_consent', 'created_at']
    list_filter = ['status', 'marketing_consent']
    search_fields = ['phone', 'name']


@admin.register(StaffUser)
class StaffUserAdmin(admin.ModelAdmin):
    list_display = ['login', 'role', 'status', 'created_at']
    list_filter = ['role', 'status']
    search_fields = ['login']

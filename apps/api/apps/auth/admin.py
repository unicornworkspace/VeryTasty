from django.contrib import admin

from .models import OTPSession, RefreshToken


@admin.register(OTPSession)
class OTPSessionAdmin(admin.ModelAdmin):
    list_display = ['phone', 'is_verified', 'attempts', 'created_at', 'expires_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['phone']
    readonly_fields = ['phone', 'otp_hash', 'attempts', 'created_at', 'expires_at']
    date_hierarchy = 'created_at'


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_revoked', 'device_info', 'created_at', 'expires_at']
    list_filter = ['is_revoked', 'created_at']
    search_fields = ['user__phone', 'user__name']
    readonly_fields = ['user', 'token_hash', 'device_info', 'created_at', 'expires_at']
    date_hierarchy = 'created_at'

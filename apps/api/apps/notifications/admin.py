from django.contrib import admin

from .models import AuditLog, Device, OutboxEvent


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ['user', 'platform', 'push_token', 'enabled', 'updated_at']
    list_filter = ['platform', 'enabled']
    search_fields = ['user__phone', 'push_token']


@admin.register(OutboxEvent)
class OutboxEventAdmin(admin.ModelAdmin):
    list_display = ['type', 'aggregate_id', 'status', 'attempts', 'created_at']
    list_filter = ['status', 'type']
    search_fields = ['type', 'aggregate_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['actor_type', 'actor_id', 'action', 'entity_type', 'entity_id', 'created_at']
    list_filter = ['actor_type', 'action', 'entity_type']
    search_fields = ['action', 'entity_type']
    readonly_fields = ['created_at', 'payload_json']

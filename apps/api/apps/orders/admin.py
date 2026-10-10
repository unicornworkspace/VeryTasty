from django.contrib import admin

from .models import Request, RequestItem


class RequestItemInline(admin.TabularInline):
    model = RequestItem
    extra = 0
    readonly_fields = ['name_snapshot', 'price_snapshot', 'qty']


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_preview', 'channel', 'created_at']
    list_filter = ['status', 'channel']
    search_fields = ['user__phone', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [RequestItemInline]

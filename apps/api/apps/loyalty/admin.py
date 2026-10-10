from django.contrib import admin

from .models import LoyaltyAccount, LoyaltyTransaction


@admin.register(LoyaltyAccount)
class LoyaltyAccountAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance_cached', 'status']
    list_filter = ['status']
    search_fields = ['user__phone', 'user__name']


@admin.register(LoyaltyTransaction)
class LoyaltyTransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'amount', 'idempotency_key', 'created_by', 'created_at']
    list_filter = ['type']
    search_fields = ['user__phone', 'idempotency_key']
    readonly_fields = ['created_at']

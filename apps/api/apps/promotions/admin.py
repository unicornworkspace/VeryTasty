from django.contrib import admin

from .models import PromoCode, Promotion


class PromoCodeInline(admin.TabularInline):
    model = PromoCode
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ['title', 'promotion_type', 'discount_value', 'status', 'start_at', 'end_at']
    list_filter = ['promotion_type', 'status', 'audience_type']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PromoCodeInline]


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'promotion', 'used_count', 'max_uses', 'expires_at']
    search_fields = ['code']
    readonly_fields = ['used_count', 'created_at']

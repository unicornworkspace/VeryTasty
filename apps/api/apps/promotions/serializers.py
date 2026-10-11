from rest_framework import serializers
from .models import Promotion, PromoCode


class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = ['id', 'code', 'max_uses', 'used_count', 'expires_at']


class PromotionSerializer(serializers.ModelSerializer):
    promo_codes = PromoCodeSerializer(many=True, read_only=True)

    class Meta:
        model = Promotion
        fields = [
            'id', 'title', 'description', 'image_url', 'promotion_type',
            'discount_value', 'start_at', 'end_at', 'status', 'audience_type',
            'promo_codes',
        ]

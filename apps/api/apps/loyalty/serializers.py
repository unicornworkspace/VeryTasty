from rest_framework import serializers

from .models import LoyaltyAccount, LoyaltyTransaction


class LoyaltyAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyAccount
        fields = ['id', 'user', 'balance_cached', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = LoyaltyTransaction
        fields = [
            'id', 'user', 'user_name', 'user_phone', 'type', 'amount',
            'reference_type', 'reference_id', 'idempotency_key',
            'created_by', 'comment', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

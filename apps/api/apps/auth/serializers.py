from rest_framework import serializers

from apps.users.models import User

from .models import OTPSession, RefreshToken


class OTPRequestSerializer(serializers.Serializer):
    """Serializer for OTP request: phone number."""

    phone = serializers.CharField(max_length=20)
    device_info = serializers.CharField(
        required=False,
        allow_blank=True,
        default='',
    )

    def validate_phone(self, value: str) -> str:
        """Validate and normalize phone number."""
        # Strip spaces, dashes, parentheses
        cleaned = value.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not cleaned.startswith('+'):
            cleaned = '+' + cleaned
        if len(cleaned) < 10 or len(cleaned) > 16:
            raise serializers.ValidationError('Некорректный номер телефона')
        return cleaned


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for OTP verification: phone + code."""

    phone = serializers.CharField(max_length=20)
    otp_code = serializers.CharField(max_length=10)
    device_info = serializers.CharField(
        required=False,
        allow_blank=True,
        default='',
    )

    def validate_phone(self, value: str) -> str:
        cleaned = value.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not cleaned.startswith('+'):
            cleaned = '+' + cleaned
        return cleaned


class TokenRefreshSerializer(serializers.Serializer):
    """Serializer for token refresh."""

    refresh_token = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    """Serializer for logout."""

    refresh_token = serializers.CharField()


class UserMeSerializer(serializers.ModelSerializer):
    """Serializer for current user profile."""

    class Meta:
        model = User
        fields = ['id', 'phone', 'name', 'marketing_consent', 'created_at']
        read_only_fields = ['id', 'phone', 'created_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = ['name', 'marketing_consent']

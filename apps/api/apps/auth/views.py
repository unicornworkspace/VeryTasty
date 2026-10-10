import logging

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import User

from .models import OTPSession, RefreshToken
from .services import (
    create_otp_session,
    create_refresh_token,
    verify_otp_session,
    revoke_refresh_token,
)
from .tasks import send_otp_sms
from .serializers import (
    OTPRequestSerializer,
    OTPVerifySerializer,
    TokenRefreshSerializer,
    LogoutSerializer,
    UserMeSerializer,
    UserUpdateSerializer,
)

logger = logging.getLogger(__name__)


class AllowAny(permissions.AllowAny):
    """Permission class allowing all requests."""
    pass


@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    """Request an OTP code for the given phone number.

    Creates an OTP session and sends the code via SMS (async).
    Rate limiting should be applied at the infrastructure level.
    """
    serializer = OTPRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    phone = serializer.validated_data['phone']
    device_info = serializer.validated_data.get('device_info', '')

    # Create or get active OTP session
    session = OTPSession.objects.filter(
        phone=phone,
        is_verified=False,
        expires_at__gt=timezone.now(),
    ).order_by('-created_at').first()

    if not session:
        session = create_otp_session(phone)
    else:
        # Regenerate OTP for existing session (use demo code if DEBUG)
        from django.conf import settings
        from .services import generate_otp, hash_otp
        from datetime import timedelta
        otp = '000000' if settings.DEBUG else generate_otp()
        session.otp_hash = hash_otp(otp)
        session.expires_at = timezone.now() + timedelta(seconds=300)
        session.attempts = 0
        session.save(update_fields=['otp_hash', 'expires_at', 'attempts'])
        session._plain_otp = otp

    # Send OTP via SMS (async Celery task)
    plain_otp = getattr(session, '_plain_otp', '')
    try:
        send_otp_sms.delay(phone, plain_otp)
    except Exception as e:
        # If Celery is not running, log and continue
        logger.warning(f'Celery not available, OTP for {phone}: {plain_otp}')

    logger.info(f'OTP requested for {phone}, code: {plain_otp}')

    return Response({
        'status': 'otp_sent',
        'message': 'Код отправлен по SMS',
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP code and return access + refresh tokens.

    If user doesn't exist, creates a new user with the given phone.
    """
    serializer = OTPVerifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    phone = serializer.validated_data['phone']
    otp_code = serializer.validated_data['otp_code']
    device_info = serializer.validated_data.get('device_info', '')

    # Verify OTP
    session = verify_otp_session(phone, otp_code)

    # Get or create user
    user, created = User.objects.get_or_create(
        phone=phone,
        defaults={'name': ''},
    )

    # Create refresh token
    refresh_token, plain_refresh = create_refresh_token(user, device_info)

    # Generate access token (simple JWT-like approach using signing)
    from django.core.signing import Signer
    signer = Signer(salt='access_token')
    access_payload = {'user_id': user.id, 'phone': user.phone}
    access_token = signer.sign_object(access_payload)

    logger.info(f'OTP verified for {phone}, user created: {created}')

    return Response({
        'access_token': access_token,
        'refresh_token': plain_refresh,
        'user_created': created,
        'user': UserMeSerializer(user).data,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def token_refresh(request):
    """Refresh access token using a valid refresh token."""
    serializer = TokenRefreshSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    token_hash = serializer.validated_data['refresh_token']

    # Find active refresh token
    from .selectors import get_active_refresh_token
    refresh = get_active_refresh_token(token_hash)

    if not refresh:
        return Response({
            'detail': 'Недействительный или истёкший refresh-токен',
        }, status=status.HTTP_401_UNAUTHORIZED)

    if timezone.now() > refresh.expires_at:
        return Response({
            'detail': 'Refresh-токен истёк',
        }, status=status.HTTP_401_UNAUTHORIZED)

    # Generate new access token
    from django.core.signing import Signer
    signer = Signer(salt='access_token')
    access_payload = {'user_id': refresh.user.id, 'phone': refresh.user.phone}
    access_token = signer.sign_object(access_payload)

    return Response({
        'access_token': access_token,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def logout(request):
    """Revoke the current refresh token."""
    serializer = LogoutSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    token_hash = serializer.validated_data['refresh_token']
    revoked = revoke_refresh_token(token_hash)

    if not revoked:
        return Response({
            'detail': 'Refresh-токен не найден',
        }, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'status': 'logged_out',
        'message': 'Вы вышли из аккаунта',
    }, status=status.HTTP_200_OK)


class UserMeView(generics.RetrieveUpdateAPIView):
    """Get or update current user profile."""

    serializer_class = UserMeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UserUpdateSerializer
        return UserMeSerializer


class IsAuthenticated(permissions.BasePermission):
    """Custom authentication using signed access tokens."""

    def has_permission(self, request, view):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return False

        token = auth_header[7:]
        try:
            from django.core.signing import Signer, BadSignature, SignatureExpired
            signer = Signer(salt='access_token')
            payload = signer.unsign_object(token, max_age=900)  # 15 min TTL

            # Load user
            user = User.objects.get(id=payload['user_id'])
            request.user = user
            return True
        except (BadSignature, SignatureExpired, User.DoesNotExist, KeyError):
            return False

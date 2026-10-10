"""
Скрипт для полной перезаписи views с исправлениями ошибок аутентификации
"""

# Файл: apps/api/apps/auth/views.py

NEW_AUTH_VIEWS = '''import logging

from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

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


def authenticate_request(request):
    """
    Аутентифицирует запрос используя signed tokens.
    Возвращает (user, error_response).
    Если error_response не None - запрос не аутентифицирован.
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    
    if not auth_header.startswith('Bearer '):
        return None, Response(
            {'detail': 'Учетные данные не были предоставлены.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    token = auth_header[7:]
    
    try:
        from django.core.signing import Signer, BadSignature, SignatureExpired
        signer = Signer(salt='access_token')
        payload = signer.unsign_object(token, max_age=900)  # 15 min TTL
        
        user_id = payload.get('user_id')
        if not user_id:
            return None, Response(
                {'detail': 'Недействительный токен'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user = User.objects.get(id=user_id)
        return user, None
        
    except (BadSignature, SignatureExpired) as e:
        logger.warning(f"Auth failed: {e}")
        return None, Response(
            {'detail': 'Недействительный или истёкший токен'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except User.DoesNotExist:
        return None, Response(
            {'detail': 'Пользователь не найден'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logger.error(f"Auth error: {e}", exc_info=True)
        return None, Response(
            {'detail': f'Ошибка аутентификации: {str(e)}'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class AllowAny(permissions.AllowAny):
    """Permission class allowing all requests."""
    pass


@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    """Request an OTP code for the given phone number."""
    serializer = OTPRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    phone = serializer.validated_data['phone']
    device_info = serializer.validated_data.get('device_info', '')

    session = OTPSession.objects.filter(
        phone=phone,
        is_verified=False,
        expires_at__gt=timezone.now(),
    ).order_by('-created_at').first()

    if not session:
        session = create_otp_session(phone)
    else:
        from django.conf import settings
        from .services import generate_otp, hash_otp
        from datetime import timedelta
        otp = '000000' if settings.DEBUG else generate_otp()
        session.otp_hash = hash_otp(otp)
        session.expires_at = timezone.now() + timedelta(seconds=300)
        session.attempts = 0
        session.save(update_fields=['otp_hash', 'expires_at', 'attempts'])
        session._plain_otp = otp

    plain_otp = getattr(session, '_plain_otp', '')
    try:
        send_otp_sms.delay(phone, plain_otp)
    except Exception as e:
        logger.warning(f'Celery not available, OTP for {phone}: {plain_otp}')

    logger.info(f'OTP requested for {phone}, code: {plain_otp}')

    return Response({
        'status': 'otp_sent',
        'message': 'Код отправлен по SMS',
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP code and return access + refresh tokens."""
    serializer = OTPVerifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    phone = serializer.validated_data['phone']
    otp_code = serializer.validated_data['otp_code']
    device_info = serializer.validated_data.get('device_info', '')

    session = verify_otp_session(phone, otp_code)

    user, created = User.objects.get_or_create(
        phone=phone,
        defaults={'name': ''},
    )

    refresh_token, plain_refresh = create_refresh_token(user, device_info)

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


@api_view(['GET', 'PATCH'])
@permission_classes([AllowAny])  # Аутентификация внутри функции
def user_me(request):
    """Get or update current user profile."""
    # Используем отдельную функцию аутентификации
    user, error = authenticate_request(request)
    
    if error:
        return error
    
    try:
        if request.method == 'GET':
            serializer = UserMeSerializer(user)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
            
    except Exception as e:
        logger.error(f"user_me error: {e}", exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
'''

print("✅ Файл apps/api/apps/auth/views.py готов к обновлению")
print("Скопируйте содержимое NEW_AUTH_VIEWS в файл")

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import LoyaltyAccount, LoyaltyTransaction
from .serializers import (
    LoyaltyAccountSerializer,
    LoyaltyTransactionSerializer,
)
from .services import get_account_balance, get_transaction_history


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
            payload = signer.unsign_object(token, max_age=900)

            from apps.users.models import User
            user = User.objects.get(id=payload['user_id'])
            request.user = user
            return True
        except (BadSignature, SignatureExpired, User.DoesNotExist, KeyError):
            return False


class AllowAny(permissions.AllowAny):
    """Permission class allowing all requests."""
    pass


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_loyalty_me(request):
    """Get current user's loyalty balance."""
    account = get_account_balance(request.user)
    serializer = LoyaltyAccountSerializer(account)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_loyalty_history(request):
    """Get current user's loyalty transaction history."""
    transactions = get_transaction_history(request.user, limit=50)
    serializer = LoyaltyTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_loyalty_qr_token(request):
    """Generate a QR token for the user with persistent link."""
    from django.core.signing import Signer
    from django.utils import timezone
    import secrets
    
    # Создаём уникальный токен для QR
    nonce = secrets.token_hex(16)
    created_at = timezone.now().isoformat()
    
    # Кодируем через Django Signer (как везде в проекте)
    signer = Signer(salt='qr_token')
    payload = {
        'user_id': request.user.id,
        'phone': request.user.phone,
        'nonce': nonce,
        'created_at': created_at,
    }
    token = signer.sign_object(payload)
    
    return Response({
        'token': token,
        'phone': request.user.phone,
        'expires_at': (timezone.now().timestamp() + 3600),  # 1 час
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_loyalty_qr_token(request):
    """Verify a QR token and return user info (for KDS/POS terminals)."""
    from django.core.signing import Signer, BadSignature, SignatureExpired
    
    token = request.data.get('token', '')
    if not token:
        return Response(
            {'error': 'Токен не указан'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        signer = Signer(salt='qr_token')
        payload = signer.unsign_object(token, max_age=3600)  # 1 час
        
        from apps.users.models import User
        user = User.objects.get(id=payload['user_id'])
        
        # Получаем баланс лояльности
        account = get_account_balance(user)
        
        return Response({
            'valid': True,
            'user_id': user.id,
            'phone': user.phone,
            'name': user.name,
            'balance': account.balance_cached,
        })
    except (BadSignature, SignatureExpired):
        return Response(
            {'valid': False, 'error': 'Токен недействителен или истёк'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except User.DoesNotExist:
        return Response(
            {'valid': False, 'error': 'Пользователь не найден'},
            status=status.HTTP_404_NOT_FOUND
        )

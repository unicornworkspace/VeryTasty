from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.users.models import User

from .models import LoyaltyAccount, LoyaltyTransaction
from .serializers import (
    LoyaltyAccountSerializer,
    LoyaltyTransactionSerializer,
)
from .services import get_account_balance, get_transaction_history
from ..auth.auth_utils import get_user_from_request


class AllowAny(permissions.AllowAny):
    """Permission class allowing all requests."""
    pass


@api_view(['GET'])
@permission_classes([AllowAny])
def get_loyalty_me(request):
    """Get current user's loyalty balance."""
    user, error = get_user_from_request(request)
    if error:
        return error
    
    try:
        account = get_account_balance(user)
        serializer = LoyaltyAccountSerializer(account)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_loyalty_history(request):
    """Get current user's loyalty transaction history."""
    user, error = get_user_from_request(request)
    if error:
        return error
    
    try:
        transactions = get_transaction_history(user, limit=50)
        serializer = LoyaltyTransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_loyalty_qr_token(request):
    """Generate a QR token for the user with persistent link."""
    user, error = get_user_from_request(request)
    if error:
        return error
    
    try:
        from django.core.signing import Signer
        from django.utils import timezone
        import secrets
        
        nonce = secrets.token_hex(16)
        created_at = timezone.now().isoformat()
        
        signer = Signer(salt='qr_token')
        payload = {
            'user_id': user.id,
            'phone': user.phone,
            'nonce': nonce,
            'created_at': created_at,
        }
        token = signer.sign_object(payload)
        
        return Response({
            'token': token,
            'phone': user.phone,
            'expires_at': (timezone.now().timestamp() + 3600),
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_loyalty_qr_token(request):
    """Verify a QR token and return user info (for KDS/POS terminals)."""
    token = request.data.get('token', '')
    if not token:
        return Response(
            {'error': 'Токен не указан'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from django.core.signing import Signer, BadSignature, SignatureExpired
        
        signer = Signer(salt='qr_token')
        payload = signer.unsign_object(token, max_age=3600)
        
        user = User.objects.get(id=payload['user_id'])
        
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
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

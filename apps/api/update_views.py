"""
Скрипт для обновления loyalty и orders views на использование shared auth
"""

import os
import sys

# Путь к проекту
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

LOYALTY_VIEWS = '''from rest_framework import permissions, status
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
    """Get current user\'s loyalty balance."""
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
    """Get current user\'s loyalty transaction history."""
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
'''

ORDERS_VIEWS = '''from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Request
from .serializers import RequestSerializer, RequestCreateSerializer
from .services import create_request, get_user_requests, get_request_by_id
from ..auth.auth_utils import get_user_from_request


class AllowAny(permissions.AllowAny):
    """Permission class allowing all requests."""
    pass


@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """Создаёт новую заявку от пользователя."""
    user, error = get_user_from_request(request)
    if error:
        return error
    
    try:
        order = create_request(
            user=user,
            items_data=request.data.get('items', []),
            comment=request.data.get('comment', ''),
        )
        
        serializer = RequestSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def list_orders(request):
    """Получает список заявок пользователя."""
    user, error = get_user_from_request(request)
    if error:
        return error
    
    limit = request.query_params.get('limit', 50)
    status_filter = request.query_params.get('status')
    
    try:
        limit = int(limit)
        if limit > 100:
            limit = 100
    except (ValueError, TypeError):
        limit = 50
    
    try:
        orders = get_user_requests(
            user=user,
            limit=limit,
            status=status_filter,
        )
        
        serializer = RequestSerializer(orders, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_order(request, pk):
    """Получает детальную информацию о заявке."""
    user, error = get_user_from_request(request)
    if error:
        return error
    
    try:
        order = get_request_by_id(pk, user=user)
        
        if not order:
            return Response(
                {'error': 'Заявка не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = RequestSerializer(order)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([AllowAny])
def update_order_status(request, pk):
    """
    Обновляет статус заявки.
    Только для внутреннего использования (KDS/POS).
    """
    user, error = get_user_from_request(request)
    if error:
        return error
    
    try:
        order = get_request_by_id(pk, user=user)
        
        if not order:
            return Response(
                {'error': 'Заявка не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Статус не указан'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.orders.models import Request as RequestModel
        from apps.orders.services import update_request_status
        
        order = update_request_status(order, new_status)
        serializer = RequestSerializer(order)
        return Response(serializer.data)
    
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
'''

print("="*60)
print("  UPDATE VIEWS FOR SHARED AUTH")
print("="*60)

# Обновляем loyalty views
loyalty_path = os.path.join(BASE_DIR, 'apps', 'loyalty', 'views.py')
print(f"\n1. Update {loyalty_path}")
try:
    with open(loyalty_path, 'w', encoding='utf-8') as f:
        f.write(LOYALTY_VIEWS)
    print("   [OK] Loyalty views updated")
except Exception as e:
    print(f"   [ERROR] {e}")

# Обновляем orders views
orders_path = os.path.join(BASE_DIR, 'apps', 'orders', 'views.py')
print(f"\n2. Update {orders_path}")
try:
    with open(orders_path, 'w', encoding='utf-8') as f:
        f.write(ORDERS_VIEWS)
    print("   [OK] Orders views updated")
except Exception as e:
    print(f"   [ERROR] {e}")

print("\n" + "="*60)
print("  DONE!")
print("="*60)
print("\nRestart server:")
print("  python manage.py runserver")

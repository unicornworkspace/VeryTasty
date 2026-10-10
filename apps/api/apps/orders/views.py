from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from .models import Request
from .serializers import RequestSerializer, RequestCreateSerializer
from .services import create_request, get_user_requests, get_request_by_id


class IsAuthenticated(BasePermission):
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


class AllowAnyPermission(BasePermission):
    """Permission class allowing all requests."""
    
    def has_permission(self, request, view):
        return True


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Создаёт новую заявку от пользователя."""
    try:
        order = create_request(
            user=request.user,
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
@permission_classes([IsAuthenticated])
def list_orders(request):
    """Получает список заявок пользователя."""
    limit = request.query_params.get('limit', 50)
    status_filter = request.query_params.get('status')
    
    try:
        limit = int(limit)
        if limit > 100:
            limit = 100
    except (ValueError, TypeError):
        limit = 50
    
    orders = get_user_requests(
        user=request.user,
        limit=limit,
        status=status_filter,
    )
    
    serializer = RequestSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order(request, pk):
    """Получает детальную информацию о заявке."""
    order = get_request_by_id(pk, user=request.user)
    
    if not order:
        return Response(
            {'error': 'Заявка не найдена'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = RequestSerializer(order)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_order_status(request, pk):
    """
    Обновляет статус заявки.
    Только для внутреннего использования (KDS/POS).
    """
    order = get_request_by_id(pk, user=request.user)
    
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
    
    try:
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

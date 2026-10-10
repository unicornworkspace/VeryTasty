from rest_framework import permissions, status
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

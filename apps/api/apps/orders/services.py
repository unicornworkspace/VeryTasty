from django.db import transaction
from .models import Request, RequestItem
from .serializers import RequestCreateSerializer


@transaction.atomic
def create_request(user, items_data, comment=''):
    """
    Создаёт новую заявку от пользователя.
    
    Args:
        user: User instance
        items_data: list of dicts with menu_item, name_snapshot, price_snapshot, qty
        comment: optional comment
        
    Returns:
        Request instance
    """
    from rest_framework.request import Request as DRFRequest
    from rest_framework.test import APIRequestFactory
    
    # Создаём mock request для сериалайзера
    factory = APIRequestFactory()
    drf_request = factory.post('/api/orders/', {}, format='json')
    drf_request.user = user
    
    # Сериализуем и валидируем данные
    serializer = RequestCreateSerializer(
        data={'items': items_data, 'comment': comment},
        context={'request': drf_request}
    )
    serializer.is_valid(raise_exception=True)
    
    # Создаём заявку
    return serializer.save()


def get_user_requests(user, limit=50, status=None):
    """
    Получает список заявок пользователя.
    
    Args:
        user: User instance
        limit: max number of requests
        status: optional status filter
        
    Returns:
        QuerySet of Request
    """
    queryset = Request.objects.filter(user=user).select_related('user').prefetch_related('items')
    
    if status:
        queryset = queryset.filter(status=status)
    
    return queryset.order_by('-created_at')[:limit]


def get_request_by_id(request_id, user=None):
    """
    Получает заявку по ID.
    
    Args:
        request_id: int
        user: optional User instance to check ownership
        
    Returns:
        Request instance or None
    """
    queryset = Request.objects.filter(
        id=request_id
    ).select_related('user').prefetch_related('items')
    
    if user:
        queryset = queryset.filter(user=user)
    
    return queryset.first()


def update_request_status(request_obj, new_status, staff_user=None):
    """
    Обновляет статус заявки.
    
    Args:
        request_obj: Request instance
        new_status: str
        staff_user: optional StaffUser
        
    Returns:
        Request instance
    """
    from apps.orders.models import Request as RequestModel
    
    if new_status not in dict(RequestModel.STATUS_CHOICES):
        raise ValueError(f'Invalid status: {new_status}')
    
    request_obj.status = new_status
    request_obj.save()
    
    return request_obj

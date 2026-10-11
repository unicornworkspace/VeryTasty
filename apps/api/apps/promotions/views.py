from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Promotion
from .serializers import PromotionSerializer


class AllowAny(permissions.AllowAny):
    pass


@api_view(['GET'])
@permission_classes([AllowAny])
def promotion_list(request):
    """Get active promotions."""
    now = timezone.now()
    promotions = Promotion.objects.filter(
        status='active',
        start_at__lte=now,
        end_at__gte=now,
    ).order_by('-start_at')
    serializer = PromotionSerializer(promotions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def promotion_detail(request, pk):
    """Get promotion detail."""
    try:
        promotion = Promotion.objects.get(pk=pk)
    except Promotion.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = PromotionSerializer(promotion)
    return Response(serializer.data)

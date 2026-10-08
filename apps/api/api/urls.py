"""
URL configuration for config project.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def health_check(request):
    """Health check endpoint."""
    from django.db import connection
    from redis import Redis

    # Check database
    try:
        connection.ensure_connection()
        db_status = 'ok'
    except Exception as e:
        db_status = f'error: {str(e)}'

    # Check Redis
    try:
        r = Redis.from_url(settings.CELERY_BROKER_URL)
        r.ping()
        redis_status = 'ok'
    except Exception as e:
        redis_status = f'error: {str(e)}'

    return Response({
        'status': 'ok',
        'database': db_status,
        'redis': redis_status,
    })


urlpatterns = [
    # Health check
    path('health', health_check, name='health-check'),

    # Admin
    path('admin/', admin.site.urls),

    # API docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API
    path('api/auth/', include('apps.auth.urls')),
    path('api/menu/', include('apps.menu.urls')),
    path('api/promotions/', include('apps.promotions.urls')),
    path('api/loyalty/', include('apps.loyalty.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/users/', include('apps.users.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

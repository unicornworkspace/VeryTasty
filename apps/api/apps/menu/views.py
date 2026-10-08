from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class MenuItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MenuItem.objects.filter(is_active=True, stop_list=False)
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

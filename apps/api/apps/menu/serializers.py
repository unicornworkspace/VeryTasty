from rest_framework import serializers

from .models import Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'sort_order', 'is_active']


class MenuItemSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        many=True,
        source='categories',
        write_only=True,
    )

    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'slug', 'description', 'image_url',
            'unit', 'quantity', 'price', 'is_active', 'stop_list',
            'categories', 'category_ids',
        ]

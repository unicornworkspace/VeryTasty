from rest_framework import serializers
from .models import Request, RequestItem
from apps.menu.models import MenuItem


class RequestItemSerializer(serializers.ModelSerializer):
    """Сериалайзер позиции заявки."""
    menu_item_name = serializers.CharField(source='name_snapshot', read_only=True)

    class Meta:
        model = RequestItem
        fields = [
            'id',
            'menu_item',
            'menu_item_name',
            'name_snapshot',
            'price_snapshot',
            'qty',
        ]


class RequestItemCreateSerializer(serializers.Serializer):
    """Сериалайзер для создания позиции заявки."""
    menu_item = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )
    name_snapshot = serializers.CharField(max_length=200)
    price_snapshot = serializers.DecimalField(max_digits=10, decimal_places=2)
    qty = serializers.IntegerField(min_value=1, default=1)

    def validate_qty(self, value):
        if value < 1:
            raise serializers.ValidationError('Количество должно быть не менее 1')
        return value


class RequestSerializer(serializers.ModelSerializer):
    """Сериалайзер заявки."""
    items = RequestItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Request
        fields = [
            'id',
            'user',
            'status',
            'total_preview',
            'comment',
            'channel',
            'created_at',
            'updated_at',
            'items',
            'items_count',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_items_count(self, obj):
        return obj.items.count()


class RequestCreateSerializer(serializers.Serializer):
    """Сериалайзер для создания заявки."""
    items = RequestItemCreateSerializer(many=True)
    comment = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Заявка должна содержать хотя бы один товар')
        if len(value) > 100:
            raise serializers.ValidationError('Не более 100 позиций в заявке')
        return value

    def create(self, validated_data):
        """Создаёт заявку с позициями."""
        items_data = validated_data.pop('items')
        comment = validated_data.pop('comment', '')

        user = self.context['request'].user

        # Считаем общую сумму
        total = sum(
            item['price_snapshot'] * item['qty']
            for item in items_data
        )

        validated_data['user'] = user
        validated_data['total_preview'] = total
        validated_data['comment'] = comment
        validated_data['channel'] = 'web'

        request = Request.objects.create(**validated_data)

        for item_data in items_data:
            RequestItem.objects.create(
                request=request,
                **item_data,
            )

        return request

from django.db import models


class Request(models.Model):
    """Guest order/request."""

    STATUS_NEW = 'NEW'
    STATUS_CONFIRMED = 'CONFIRMED'
    STATUS_PREPARING = 'PREPARING'
    STATUS_READY = 'READY'
    STATUS_COMPLETED = 'COMPLETED'
    STATUS_CANCELLED = 'CANCELLED'

    STATUS_CHOICES = [
        (STATUS_NEW, 'Новая'),
        (STATUS_CONFIRMED, 'Подтверждена'),
        (STATUS_PREPARING, 'Готовится'),
        (STATUS_READY, 'Готова'),
        (STATUS_COMPLETED, 'Завершена'),
        (STATUS_CANCELLED, 'Отменена'),
    ]

    user = models.ForeignKey(
        'users.User',
        on_delete=models.PROTECT,
        verbose_name='Гость',
        related_name='requests',
    )
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    total_preview = models.DecimalField('Итого (предварительно)', max_digits=10, decimal_places=2, default=0)
    comment = models.TextField('Комментарий', blank=True, default='')
    channel = models.CharField('Канал', max_length=50, default='web')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата изменения', auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'

    def __str__(self):
        return f'Заявка #{self.id} — {self.user}'


class RequestItem(models.Model):
    """Item in a guest request."""

    request = models.ForeignKey(
        'Request',
        on_delete=models.PROTECT,
        verbose_name='Заявка',
        related_name='items',
    )
    menu_item = models.ForeignKey(
        'menu.MenuItem',
        on_delete=models.SET_NULL,
        verbose_name='Блюдо',
        null=True,
        blank=True,
    )
    name_snapshot = models.CharField('Название (снимок)', max_length=200)
    price_snapshot = models.DecimalField('Цена (снимок)', max_digits=10, decimal_places=2)
    qty = models.PositiveIntegerField('Количество', default=1)

    class Meta:
        verbose_name = 'Позиция заявки'
        verbose_name_plural = 'Позиции заявки'

    def __str__(self):
        return f'#{self.id} — {self.name_snapshot} × {self.qty}'

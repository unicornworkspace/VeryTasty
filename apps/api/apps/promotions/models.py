from django.db import models


class Promotion(models.Model):
    """Promotional campaign."""

    TYPE_PERCENT = 'percent'
    TYPE_FIXED = 'fixed'
    TYPE_CODE = 'code'

    TYPE_CHOICES = [
        (TYPE_PERCENT, 'Процентная скидка'),
        (TYPE_FIXED, 'Фиксированная скидка'),
        (TYPE_CODE, 'Промокод'),
    ]

    audience_guest = 'guest'
    audience_new = 'new'
    audience_all = 'all'

    AUDIENCE_CHOICES = [
        (audience_guest, 'Все гости'),
        (audience_new, 'Новые гости'),
        (audience_all, 'Выбранная аудитория'),
    ]

    title = models.CharField('Название', max_length=200)
    description = models.TextField('Описание', blank=True, default='')
    image_url = models.URLField('Ссылка на фото', blank=True, default='')
    promotion_type = models.CharField('Тип', max_length=20, choices=TYPE_CHOICES)
    discount_value = models.DecimalField('Значение скидки', max_digits=6, decimal_places=2)
    start_at = models.DateTimeField('Начало')
    end_at = models.DateTimeField('Окончание')
    status = models.CharField('Статус', max_length=20, default='draft')
    audience_type = models.CharField('Аудитория', max_length=20, choices=AUDIENCE_CHOICES, default=audience_all)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата изменения', auto_now=True)

    class Meta:
        ordering = ['-start_at']
        verbose_name = 'Акция'
        verbose_name_plural = 'Акции'

    def __str__(self):
        return self.title


class PromoCode(models.Model):
    """Promo code for a promotion."""

    code = models.CharField('Код', max_length=50, unique=True)
    promotion = models.ForeignKey(
        'Promotion',
        on_delete=models.CASCADE,
        verbose_name='Акция',
        related_name='promo_codes',
    )
    max_uses = models.PositiveIntegerField('Макс. использований', blank=True, null=True)
    used_count = models.PositiveIntegerField('Использовано', default=0)
    expires_at = models.DateTimeField('Срок действия', blank=True, null=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Промокод'
        verbose_name_plural = 'Промокоды'

    def __str__(self):
        return self.code

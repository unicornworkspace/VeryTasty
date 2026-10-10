from django.db import models
from django.db.models import Sum

from .validators import positive_decimal_validator


class LoyaltyAccount(models.Model):
    """Loyalty account for a guest user."""

    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name='Гость',
        related_name='loyalty_account',
    )
    balance_cached = models.DecimalField(
        'Баланс',
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[positive_decimal_validator],
    )
    status = models.CharField('Статус', max_length=50, default='active')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата изменения', auto_now=True)

    class Meta:
        verbose_name = 'Счёт лояльности'
        verbose_name_plural = 'Счета лояльности'

    def __str__(self):
        return f'{self.user} — {self.balance_cached}'

    def recalculate_balance(self):
        """Recalculate balance from transaction ledger."""
        total = self.transactions.aggregate(
            total=Sum('amount', default=0)
        )['total']
        self.balance_cached = max(0, total)
        self.save(update_fields=['balance_cached', 'updated_at'])
        return self.balance_cached


class LoyaltyTransaction(models.Model):
    """Immutable loyalty transaction ledger."""

    TYPE_EARN = 'earn'
    TYPE_SPEND = 'spend'
    TYPE_BONUS = 'bonus'
    TYPE_REFUND = 'refund'

    TYPE_CHOICES = [
        (TYPE_EARN, 'Начисление'),
        (TYPE_SPEND, 'Списание'),
        (TYPE_BONUS, 'Бонус'),
        (TYPE_REFUND, 'Возврат'),
    ]

    user = models.ForeignKey(
        'users.User',
        on_delete=models.PROTECT,
        verbose_name='Гость',
        related_name='loyalty_transactions',
    )
    account = models.ForeignKey(
        'LoyaltyAccount',
        on_delete=models.CASCADE,
        verbose_name='Счёт лояльности',
        related_name='transactions',
        null=True,
        blank=True,
    )
    type = models.CharField('Тип', max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField('Сумма', max_digits=10, decimal_places=2)
    reference_type = models.CharField('Тип ссылки', max_length=50, blank=True, default='')
    reference_id = models.CharField('ID ссылки', max_length=100, blank=True, default='')
    idempotency_key = models.CharField(
        'Ключ идемпотентности',
        max_length=100,
        unique=True,
        db_index=True,
    )
    created_by = models.ForeignKey(
        'users.StaffUser',
        on_delete=models.SET_NULL,
        verbose_name='Кто провёл',
        null=True,
        blank=True,
    )
    comment = models.TextField('Комментарий', blank=True, default='')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Операция лояльности'
        verbose_name_plural = 'Операции лояльности'

    def __str__(self):
        return f'{self.user} — {self.type} — {self.amount}'

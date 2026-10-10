from django.db import models


class Device(models.Model):
    """Mobile device for push notifications."""

    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name='Гость',
        related_name='devices',
    )
    platform = models.CharField('Платформа', max_length=20)
    push_token = models.CharField('Push-токен', max_length=500)
    enabled = models.BooleanField('Включён', default=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Устройство'
        verbose_name_plural = 'Устройства'

    def __str__(self):
        return f'{self.user} — {self.platform}'


class OutboxEvent(models.Model):
    """Outbox pattern event for reliable notification delivery."""

    type = models.CharField('Тип события', max_length=100)
    aggregate_id = models.CharField('ID аггрегатора', max_length=100)
    payload_json = models.JSONField('Данные', default=dict)
    status = models.CharField('Статус', max_length=20, default='pending')
    attempts = models.PositiveIntegerField('Попытки', default=0)
    next_attempt_at = models.DateTimeField('След. попытка', null=True, blank=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата изменения', auto_now=True)

    class Meta:
        verbose_name = 'Событие outbox'
        verbose_name_plural = 'События outbox'

    def __str__(self):
        return f'{self.type} — {self.aggregate_id}'


class AuditLog(models.Model):
    """Audit trail for staff actions."""

    actor_type = models.CharField('Тип актора', max_length=20)
    actor_id = models.PositiveIntegerField('ID актора')
    action = models.CharField('Действие', max_length=100)
    entity_type = models.CharField('Тип сущности', max_length=100)
    entity_id = models.PositiveIntegerField('ID сущности')
    payload_json = models.JSONField('Данные', default=dict)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Запись аудита'
        verbose_name_plural = 'Записи аудита'

    def __str__(self):
        return f'{self.actor_type}:{self.actor_id} — {self.action}'

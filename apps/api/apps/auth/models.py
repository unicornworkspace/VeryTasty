from django.db import models


class OTPSession(models.Model):
    """Session for OTP verification flow."""

    phone = models.CharField('Телефон', max_length=20)
    otp_hash = models.CharField('Хеш OTP', max_length=255)
    attempts = models.PositiveIntegerField('Попытки', default=0)
    max_attempts = models.PositiveIntegerField('Макс. попытки', default=5)
    is_verified = models.BooleanField('Подтверждён', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    expires_at = models.DateTimeField('Срок действия')

    class Meta:
        verbose_name = 'OTP-сессия'
        verbose_name_plural = 'OTP-сессии'

    def __str__(self):
        return f'{self.phone} — {"✓" if self.is_verified else "✗"}'


class RefreshToken(models.Model):
    """Opaque refresh token stored in DB for rotation."""

    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name='Гость',
        related_name='refresh_tokens',
    )
    token_hash = models.CharField('Хеш токена', max_length=255, db_index=True)
    device_info = models.TextField('Информация о устройстве', blank=True, default='')
    is_revoked = models.BooleanField('Отозван', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    expires_at = models.DateTimeField('Срок действия')

    class Meta:
        verbose_name = 'Refresh-токен'
        verbose_name_plural = 'Refresh-токены'

    def __str__(self):
        return f'{self.user} — {"✓" if not self.is_revoked else "✗"}'

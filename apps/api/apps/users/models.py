from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, phone, name='', password=None, **extra_fields):
        if not phone:
            raise ValueError('Phone number is required')
        user = self.model(phone=phone, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, name='', password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone, name, password, **extra_fields)


class User(AbstractBaseUser):
    """Guest user profile."""

    phone = models.CharField('Телефон', max_length=20, unique=True)
    name = models.CharField('Имя', max_length=200, default='')
    status = models.CharField('Статус', max_length=50, default='active')
    marketing_consent = models.BooleanField('Согласие на маркетинг', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата изменения', auto_now=True)

    is_staff = models.BooleanField('Доступ к панели', default=False)
    is_active = models.BooleanField('Активен', default=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['name']

    class Meta:
        verbose_name = 'Гость'
        verbose_name_plural = 'Гости'

    def __str__(self):
        return f'{self.name} ({self.phone})'


class StaffUser(models.Model):
    """Restaurant staff member."""

    ROLE_OWNER = 'owner'
    ROLE_MANAGER = 'manager'
    ROLE_STAFF = 'staff'

    ROLE_CHOICES = [
        (ROLE_OWNER, 'Владелец'),
        (ROLE_MANAGER, 'Менеджер'),
        (ROLE_STAFF, 'Персонал'),
    ]

    login = models.CharField('Логин', max_length=100, unique=True)
    password_hash = models.CharField('Хеш пароля', max_length=255)
    role = models.CharField('Роль', max_length=20, choices=ROLE_CHOICES, default=ROLE_STAFF)
    status = models.CharField('Статус', max_length=50, default='active')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата изменения', auto_now=True)

    class Meta:
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'

    def __str__(self):
        return f'{self.login} ({self.get_role_display()})'

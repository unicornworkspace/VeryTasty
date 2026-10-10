from django.db import models


class Category(models.Model):
    """Menu category for grouping dishes."""

    name = models.CharField('Название', max_length=200)
    slug = models.SlugField('Техническое название', max_length=200, unique=True)
    image = models.ImageField('Фото', upload_to='categories/', blank=True, null=True)
    sort_order = models.PositiveIntegerField('Порядок сортировки', default=0)
    is_active = models.BooleanField('Активна', default=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата изменения', auto_now=True)

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории меню'

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """A single dish in the menu."""

    name = models.CharField('Название', max_length=200)
    slug = models.SlugField('Техническое название', max_length=200, unique=True)
    description = models.TextField('Описание', blank=True, default='')
    image_url = models.URLField('Ссылка на фото', blank=True, default='')
    unit = models.CharField('Единица измерения', max_length=50, default='шт.')
    quantity = models.DecimalField('Количество', max_digits=6, decimal_places=2, default=1)
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    is_active = models.BooleanField('Активно', default=True)
    stop_list = models.BooleanField('Стоп-лист', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата изменения', auto_now=True)

    categories = models.ManyToManyField('Category', 'Категории', blank=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Блюдо'
        verbose_name_plural = 'Блюда'

    def __str__(self):
        return f'{self.name} — {self.price}'

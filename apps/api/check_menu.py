import os
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'api.settings.local'
django.setup()

from apps.menu.models import Category, MenuItem

print("=== Categories ===")
categories = Category.objects.all()
print(f"Count: {categories.count()}")
for cat in categories:
    print(f"  - {cat.name} ({cat.slug}) - active: {cat.is_active}")

print("\n=== Menu Items ===")
items = MenuItem.objects.all()
print(f"Count: {items.count()}")
for item in items:
    print(f"  - {item.name} - price: {item.price} - active: {item.is_active} - stop_list: {item.stop_list}")
    print(f"    Categories: {[c.name for c in item.categories.all()]}")

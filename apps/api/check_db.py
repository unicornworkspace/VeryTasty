import os
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'api.settings.local'
django.setup()

from apps.loyalty.models import LoyaltyAccount
from apps.users.models import User

print("=== Users ===")
for user in User.objects.all():
    print(f"  {user.phone} - {user.name}")

print("\n=== Loyalty Accounts ===")
for account in LoyaltyAccount.objects.all():
    print(f"  User: {account.user.phone}")
    print(f"  Balance: {account.balance_cached}")

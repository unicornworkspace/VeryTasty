from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.loyalty.services import get_or_create_account, create_transaction
from apps.loyalty.models import LoyaltyTransaction


class Command(BaseCommand):
    help = 'Create test loyalty data for demo'

    def handle(self, *args, **options):
        # Get or create test user
        user, created = User.objects.get_or_create(
            phone='+79991234567',
            defaults={'name': 'Тестовый Гость'},
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created user: {user}'))
        else:
            self.stdout.write(f'User already exists: {user}')

        # Clear existing test transactions
        LoyaltyTransaction.objects.filter(
            user=user,
            idempotency_key__startswith='test_tx_'
        ).delete()
        self.stdout.write('Cleared existing test transactions')

        # Create or get loyalty account
        account = get_or_create_account(user)
        self.stdout.write(self.style.SUCCESS(f'Loyalty account: {account.balance_cached}'))

        # Create some test transactions
        test_transactions = [
            {'type': 'earn', 'amount': 100, 'comment': 'Бонус за первый заказ'},
            {'type': 'earn', 'amount': 250, 'comment': 'Бонус за покупку'},
            {'type': 'spend', 'amount': -50, 'comment': 'Оплата бонусами'},
            {'type': 'bonus', 'amount': 200, 'comment': 'Промо-бонус'},
        ]

        for i, tx_data in enumerate(test_transactions):
            try:
                tx = create_transaction(
                    user=user,
                    transaction_type=tx_data['type'],
                    amount=tx_data['amount'],
                    idempotency_key=f'test_tx_{i}',
                    comment=tx_data['comment'],
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Created transaction: {tx.type} — {tx.amount}')
                )
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating transaction: {e}'))

        # Recalculate final balance
        account.recalculate_balance()
        self.stdout.write(
            self.style.SUCCESS(f'Final balance: {account.balance_cached}')
        )

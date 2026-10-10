from .models import LoyaltyAccount, LoyaltyTransaction


def get_or_create_account(user) -> LoyaltyAccount:
    """Get or create loyalty account for user."""
    account, created = LoyaltyAccount.objects.get_or_create(
        user=user,
        defaults={'balance_cached': 0},
    )
    return account


def get_account_balance(user) -> LoyaltyAccount:
    """Get user's loyalty account and recalculate balance."""
    account = get_or_create_account(user)
    account.recalculate_balance()
    return account


def get_transaction_history(user, limit: int = 50):
    """Get user's transaction history."""
    return LoyaltyTransaction.objects.filter(
        user=user,
    ).order_by('-created_at')[:limit]


def create_transaction(
    user,
    transaction_type: str,
    amount,
    idempotency_key: str,
    reference_type: str = '',
    reference_id: str = '',
    comment: str = '',
    created_by=None,
) -> LoyaltyTransaction:
    """Create a new loyalty transaction.

    Raises:
        ValueError: If idempotency key already exists.
    """
    account = get_or_create_account(user)

    transaction = LoyaltyTransaction.objects.create(
        user=user,
        account=account,
        type=transaction_type,
        amount=amount,
        reference_type=reference_type,
        reference_id=reference_id,
        idempotency_key=idempotency_key,
        comment=comment,
        created_by=created_by,
    )

    # Recalculate balance
    account.recalculate_balance()

    return transaction

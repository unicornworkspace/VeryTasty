from .models import LoyaltyAccount, LoyaltyTransaction


def get_account_by_user(user) -> LoyaltyAccount | None:
    """Get loyalty account by user."""
    try:
        return LoyaltyAccount.objects.get(user=user)
    except LoyaltyAccount.DoesNotExist:
        return None


def get_transactions_by_user(user, limit: int = 50):
    """Get transactions by user."""
    return LoyaltyTransaction.objects.filter(
        user=user,
    ).order_by('-created_at')[:limit]

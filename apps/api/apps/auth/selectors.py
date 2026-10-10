from .models import OTPSession, RefreshToken


def get_latest_otp_session(phone: str) -> OTPSession | None:
    """Get the latest OTP session for a phone number."""
    return OTPSession.objects.filter(phone=phone).order_by('-created_at').first()


def get_active_refresh_token(token_hash: str) -> RefreshToken | None:
    """Get an active (not revoked) refresh token by its hash."""
    return RefreshToken.objects.filter(
        token_hash=token_hash,
        is_revoked=False,
    ).first()


def get_user_refresh_tokens(user) -> RefreshToken:
    """Get all active refresh tokens for a user."""
    return RefreshToken.objects.filter(
        user=user,
        is_revoked=False,
    ).order_by('-created_at')

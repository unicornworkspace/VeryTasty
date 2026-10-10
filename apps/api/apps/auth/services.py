import logging
import os
import secrets
import hashlib
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from .models import OTPSession, RefreshToken

logger = logging.getLogger(__name__)

OTP_LENGTH = 6
OTP_TTL_SECONDS = 300  # 5 minutes
TOKEN_TTL_DAYS = 30  # 30 days for refresh token


def generate_otp() -> str:
    """Generate a numeric OTP code."""
    otp = secrets.randbelow(10 ** OTP_LENGTH)
    return str(otp).zfill(OTP_LENGTH)


def hash_otp(otp: str) -> str:
    """Hash OTP for secure storage."""
    return hashlib.sha256(otp.encode()).hexdigest()


def create_otp_session(phone: str) -> OTPSession:
    """Create a new OTP session with a generated code.

    Returns:
        OTPSession with the plain OTP code set as _plain_otp attribute.
    """
    # Use demo code for local development
    from django.conf import settings
    is_local = settings.DEBUG
    otp = '000000' if is_local else generate_otp()

    expires_at = timezone.now() + timedelta(seconds=OTP_TTL_SECONDS)

    session = OTPSession.objects.create(
        phone=phone,
        otp_hash=hash_otp(otp),
        expires_at=expires_at,
    )
    # Store plain OTP as attribute for SMS sending (not saved to DB)
    session._plain_otp = otp
    return session


def verify_otp_session(phone: str, otp: str) -> OTPSession:
    """Verify an OTP code.

    Raises:
        ValueError: If OTP is invalid, expired, or max attempts reached.

    Returns:
        Verified OTPSession.
    """
    session = OTPSession.objects.filter(
        phone=phone,
        is_verified=False,
    ).order_by('-created_at').first()

    if not session:
        raise ValueError('OTP-сессия не найдена')

    if session.attempts >= session.max_attempts:
        raise ValueError('Превышено максимальное количество попыток')

    if timezone.now() > session.expires_at:
        raise ValueError('OTP-код истёк')

    if session.otp_hash != hash_otp(otp):
        session.attempts += 1
        session.save(update_fields=['attempts'])
        raise ValueError('Неверный OTP-код')

    session.is_verified = True
    session.save(update_fields=['is_verified'])
    return session


def create_refresh_token(user, device_info: str = '') -> RefreshToken:
    """Create a new opaque refresh token.

    Returns:
        Tuple of (RefreshToken instance, plain token string).
    """
    plain_token = secrets.token_hex(32)
    token_hash = hashlib.sha256(plain_token.encode()).hexdigest()
    expires_at = timezone.now() + timedelta(days=TOKEN_TTL_DAYS)

    token = RefreshToken.objects.create(
        user=user,
        token_hash=token_hash,
        device_info=device_info,
        expires_at=expires_at,
    )
    return token, plain_token


def revoke_refresh_token(token_hash: str) -> bool:
    """Revoke a refresh token by its hash.

    Returns:
        True if token was found and revoked, False otherwise.
    """
    return RefreshToken.objects.filter(
        token_hash=token_hash,
        is_revoked=False,
    ).update(is_revoked=True) > 0


def rotate_refresh_token(old_token_hash: str, user, device_info: str = ''):
    """Revoke old refresh token and create a new one.

    Returns:
        Tuple of (new RefreshToken, plain token string).
    """
    revoke_refresh_token(old_token_hash)
    return create_refresh_token(user, device_info)

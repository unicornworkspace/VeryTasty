import logging

from celery import shared_task

logger = logging.getLogger(__name__)


class SmsProvider:
    """Abstract SMS provider interface."""

    def send(self, phone: str, message: str) -> bool:
        """Send an SMS message.

        Args:
            phone: Recipient phone number (e.g. +79991234567).
            message: Message text.

        Returns:
            True if sent successfully, False otherwise.
        """
        raise NotImplementedError


class SmsRuProvider(SmsProvider):
    """SMS.ru SMS provider implementation."""

    def __init__(self, api_key: str = ''):
        self.api_key = api_key or ''

    def send(self, phone: str, message: str) -> bool:
        if not self.api_key:
            logger.warning('SMS.ru API key not configured')
            return False
        # TODO: Implement actual SMS.ru HTTP call
        logger.info(f'[SMS.ru] Would send to {phone}: {message}')
        return True


class MtsExolveProvider(SmsProvider):
    """MTS Exolve SMS provider implementation."""

    def __init__(self, api_key: str = ''):
        self.api_key = api_key or ''

    def send(self, phone: str, message: str) -> bool:
        if not self.api_key:
            logger.warning('MTS Exolve API key not configured')
            return False
        # TODO: Implement actual MTS Exolve HTTP call
        logger.info(f'[MTS Exolve] Would send to {phone}: {message}')
        return True


def get_sms_provider() -> SmsProvider:
    """Get the configured SMS provider.

    Returns:
        SmsProvider instance based on SMS_PROVIDER env var.
    """
    import os
    provider_name = os.environ.get('SMS_PROVIDER', 'sms_ru').lower()
    api_key = os.environ.get('SMS_RU_API_KEY', '')

    if provider_name == 'mts_exolve':
        return MtsExolveProvider(api_key=api_key)
    return SmsRuProvider(api_key=api_key)


@shared_task(
    name='auth.send_otp_sms',
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def send_otp_sms(self, phone: str, otp_code: str) -> bool:
    """Send OTP code via SMS using Celery task.

    Args:
        phone: Recipient phone number.
        otp_code: Plain OTP code to send.

    Returns:
        True if sent successfully.
    """
    message = f'Особо Вкусно: ваш код подтверждения: {otp_code}'
    try:
        provider = get_sms_provider()
        return provider.send(phone, message)
    except Exception as exc:
        logger.error(f'Failed to send OTP SMS to {phone}: {exc}')
        raise self.retry(exc=exc)

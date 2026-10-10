from django.core.exceptions import ValidationError


def positive_decimal_validator(value):
    """Validate that a Decimal value is non-negative."""
    if value < 0:
        raise ValidationError('Значение не может быть отрицательным')

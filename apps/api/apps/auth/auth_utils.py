"""
Shared authentication utilities for all apps.
Используется вместо DRF permission classes для кастомной аутентификации.
"""

from rest_framework import status
from rest_framework.response import Response
from apps.users.models import User


def get_user_from_request(request):
    """
    Извлекает пользователя из запроса используя signed token.
    
    Returns:
        tuple: (user, error_response)
            - user: User instance или None
            - error_response: Response instance если ошибка, None если успех
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    
    if not auth_header.startswith('Bearer '):
        return None, Response(
            {'detail': 'Учетные данные не были предоставлены.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    token = auth_header[7:]
    
    try:
        from django.core.signing import Signer, BadSignature, SignatureExpired
        signer = Signer(salt='access_token')
        payload = signer.unsign_object(token)  # Без TTL - токен валиден пока не подделан
        
        user_id = payload.get('user_id')
        if not user_id:
            return None, Response(
                {'detail': 'Недействительный токен'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user = User.objects.get(id=user_id)
        return user, None
        
    except (BadSignature, SignatureExpired) as e:
        return None, Response(
            {'detail': 'Недействительный или истёкший токен'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except User.DoesNotExist:
        return None, Response(
            {'detail': 'Пользователь не найден'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        return None, Response(
            {'detail': f'Ошибка аутентификации: {str(e)}'},
            status=status.HTTP_401_UNAUTHORIZED
        )


def require_auth(view_func):
    """
    Decorator для @api_view который добавляет аутентификацию.
    Автоматически добавляет user в request.user если аутентификация успешна.
    """
    from functools import wraps
    
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user, error = get_user_from_request(request)
        
        if error:
            return error
        
        request.user = user
        return view_func(request, *args, **kwargs)
    
    return wrapper

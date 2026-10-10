# 🔍 ДИАГНОСТИКА ПРОБЛЕМ

## Проблема
- Не загружается QR-код
- Не загружается история заказов
- Выкидывает из аккаунта при обновлении страницы

## Шаг 1: Запуск бэкенда

Убедитесь, что бэкенд запущен:

```bash
cd C:\VeryTasty\apps\api
python manage.py runserver
```

Должно появиться:
```
Starting development server at http://127.0.0.1:8000/
```

## Шаг 2: Проверка доступности API

Откройте браузер и перейдите:
- http://localhost:8000/api/health/

Должно вернуться:
```json
{
  "status": "ok",
  "database": "ok",
  "redis": "error: ..."
}
```

Если ошибка — бэкенд не запущен!

## Шаг 3: Запуск фронтенда

```bash
cd C:\VeryTasty\apps\web
npm run dev
```

Откройте http://localhost:3000

## Шаг 4: Вход в систему

1. Нажмите "Войти"
2. Телефон: `+79991234567`
3. Код: `000000`

## Шаг 5: Проверка в консоли браузера

1. Откройте DevTools (F12)
2. Перейдите во вкладку **Console**
3. Выполните вход
4. Посмотрите на логи с префиксом `[AUTH]`

Должно появиться:
```
[AUTH] Initializing auth...
[AUTH] Stored token: YES
[AUTH] Trying to get user profile with stored token...
[AUTH] Profile loaded successfully: {...}
```

Если ошибка — скопируйте сообщение об ошибке.

## Шаг 6: Проверка API Test Panel

1. Войдите в систему
2. Перейдите на http://localhost:3000/admin/api-test
3. Нажмите "Run Tests"
4. Скопируйте результаты

## Шаг 7: Проверка CORS

Если в консоли ошибка:
```
Access to fetch at 'http://localhost:8000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

То CORS не настроен. Проверьте `apps/api/api/settings/local.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
]
CORS_ALLOW_CREDENTIALS = True
```

После изменений перезапустите бэкенд!

## Шаг 8: Запуск diagnose.py

```bash
cd C:\VeryTasty\apps\api
pip install requests
python diagnose.py
```

Скрипт проверит:
- Доступность бэкенда
- CORS настройки
- Полный поток авторизации
- Все защищённые эндпоинты

## Распространённые проблемы

### 1. "Failed to fetch" / "NetworkError"
**Причина:** Бэкенд не запущен или порт заблокирован
**Решение:** `python manage.py runserver`

### 2. "CORS policy"
**Причина:** CORS не настроен
**Решение:** Добавьте настройки в `local.py` и перезапустите бэкенд

### 3. "401 Unauthorized" при загрузке страницы
**Причина:** Токен истёк и не обновился
**Решение:** Выйдите и войдите снова

### 4. QR-код не отображается
**Причина:** Нет токена авторизации
**Решение:** Убедитесь, что вы вошли в аккаунт

### 5. Заказы не загружаются
**Причина:** API endpoints не настроены
**Решение:** Проверьте `apps/orders/urls.py` и запустите `diagnose.py`

## Быстрая проверка

```bash
# 1. Проверка бэкенда
curl http://localhost:8000/api/health/

# 2. Проверка меню (без авторизации)
curl http://localhost:8000/api/menu/items/

# 3. Вход (с демо-режимом)
curl -X POST http://localhost:8000/api/auth/request-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+79991234567", "device_info": "test"}'

curl -X POST http://localhost:8000/api/auth/verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+79991234567", "otp_code": "000000", "device_info": "test"}'
```

Второй запрос должен вернуть:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user_created": false,
  "user": {...}
}
```

## Если ничего не помогло

1. Остановите бэкенд (Ctrl+C)
2. Остановите фронтенд (Ctrl+C)
3. Запустите бэкенд: `python manage.py runserver`
4. Запустите фронтенд: `npm run dev`
5. Очистите localStorage в браузере (F12 → Application → Local Storage → Clear)
6. Обновите страницу (F5)
7. Войдите снова
8. Проверьте консоль на ошибки

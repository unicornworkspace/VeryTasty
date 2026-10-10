"""
Скрипт диагностики API
Запустите: python diagnose.py
"""

import requests
import json
import sys

API_BASE = "http://localhost:8000/api"

def print_step(num, text):
    print(f"\n{'='*60}")
    print(f"ШАГ {num}: {text}")
    print('='*60)

def check_health():
    """Проверка доступности бэкенда"""
    print_step(1, "Проверка доступности бэкенда")
    try:
        r = requests.get("http://localhost:8000/health", timeout=3)
        print(f"✅ Бэкенд доступен! Status: {r.status_code}")
        print(f"Response: {r.text}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Бэкенд НЕ доступен!")
        print("Решение: Запустите сервер: python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

def check_cors():
    """Проверка CORS настроек"""
    print_step(2, "Проверка CORS")
    try:
        r = requests.get(
            f"{API_BASE}/menu/items/",
            headers={"Origin": "http://localhost:3000"},
            timeout=3
        )
        cors_header = r.headers.get("Access-Control-Allow-Origin", "NOT SET")
        print(f"CORS Origin: {cors_header}")
        if cors_header == "http://localhost:3000":
            print("✅ CORS настроен правильно")
        else:
            print("⚠️  CORS не настроен для localhost:3000")
    except Exception as e:
        print(f"⚠️  Не удалось проверить CORS: {e}")

def test_auth_flow():
    """Полный тест авторизации"""
    print_step(3, "Тест авторизации")
    
    # Шаг 1: Request OTP
    print("\n1️⃣  Отправка OTP...")
    try:
        r = requests.post(
            f"{API_BASE}/auth/request-otp/",
            json={"phone": "+79991234567", "device_info": "test"},
            timeout=5
        )
        print(f"   Status: {r.status_code}")
        print(f"   Response: {r.text}")
        if r.status_code == 200:
            print("   ✅ OTP отправлен (демо-код: 000000)")
        else:
            print("   ❌ Ошибка отправки OTP")
            return False
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return False
    
    # Шаг 2: Verify OTP
    print("\n2️⃣  Верификация OTP...")
    try:
        r = requests.post(
            f"{API_BASE}/auth/verify-otp/",
            json={"phone": "+79991234567", "otp_code": "000000", "device_info": "test"},
            timeout=5
        )
        print(f"   Status: {r.status_code}")
        data = r.json()
        print(f"   Response: {json.dumps(data, indent=4)}")
        
        if r.status_code == 200 and "access_token" in data:
            print("   ✅ Авторизация успешна!")
            return data["access_token"]
        else:
            print("   ❌ Ошибка верификации")
            return None
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return None

def test_protected_endpoints(access_token):
    """Тест защищённых эндпоинтов"""
    if not access_token:
        print("\n⚠️  Пропуск теста защищённых эндпоинтов (нет токена)")
        return
    
    print_step(4, "Тест защищённых эндпоинтов")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    endpoints = [
        ("/auth/me/", "Профиль"),
        ("/loyalty/me/", "Баланс лояльности"),
        ("/loyalty/qr-token/", "QR-код"),
        ("/orders/?limit=5", "Заказы"),
    ]
    
    for path, name in endpoints:
        print(f"\n📍 {name}: {path}")
        try:
            r = requests.get(f"{API_BASE}{path}", headers=headers, timeout=5)
            print(f"   Status: {r.status_code}")
            if r.status_code == 200:
                data = r.json()
                if isinstance(data, dict):
                    print(f"   ✅ OK — ключи: {list(data.keys())[:5]}")
                elif isinstance(data, list):
                    print(f"   ✅ OK — {len(data)} элементов")
            else:
                print(f"   ❌ Ошибка: {r.text[:200]}")
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")

def check_settings():
    """Проверка настроек Django"""
    print_step(5, "Проверка настроек Django")
    
    try:
        import django
        from django.conf import settings
        
        # Инициализируем Django
        import os
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings.local')
        django.setup()
        
        print(f"DEBUG: {settings.DEBUG}")
        print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        
        cors_settings = [x for x in dir(settings) if 'CORS' in x]
        if cors_settings:
            print("\nCORS настройки:")
            for setting in cors_settings:
                print(f"  {setting}: {getattr(settings, setting)}")
        else:
            print("\n⚠️  CORS настройки НЕ НАЙДЕНЫ")
            print("Добавьте в api/settings/local.py:")
            print("""
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
]
CORS_ALLOW_CREDENTIALS = True
            """)
            
    except ImportError as e:
        print(f"❌ Django не установлен: {e}")
    except Exception as e:
        print(f"❌ Ошибка: {e}")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("  ДИАГНОСТИКА API ОСОБО ВКУСНО")
    print("="*60)
    
    backend_ok = check_health()
    if not backend_ok:
        print("\n⛔ ДИАГНОСТИКА ЗАВЕРШЕНА. Бэкенд недоступен.")
        print("Запустите: cd C:\\VeryTasty\\apps\\api && python manage.py runserver")
        sys.exit(1)
    
    check_cors()
    access_token = test_auth_flow()
    test_protected_endpoints(access_token)
    check_settings()
    
    print("\n" + "="*60)
    print("  ДИАГНОСТИКА ЗАВЕРШЕНА")
    print("="*60)

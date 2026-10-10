# 🚀 Деплой проекта "Особо Вкусно" на TimeWeb Cloud

## 📋 Требования к серверу

- **OS:** Ubuntu 22.04 LTS
- **RAM:** 2GB минимум (4GB рекомендуется)
- **CPU:** 2+ vCPU
- **Disk:** 20GB+ SSD
- **Порт:** 80 (HTTP), 443 (HTTPS)
- **Домен:** (опционально)

---

## 1️⃣ Подготовка сервера

### Подключение к серверу
```bash
ssh user@your-server-ip
```

### Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### Установка Python 3.10+
```bash
sudo apt install -y python3.10 python3.10-venv python3.10-dev
python3.10 --version
```

### Установка Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### Установка PostgreSQL (рекомендуется вместо SQLite)
```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql
```

В PostgreSQL:
```sql
CREATE DATABASE osobo_web;
CREATE USER osobo_user WITH PASSWORD 'secure_password';
ALTER ROLE osobo_user SET client_encoding TO 'utf8';
ALTER ROLE osobo_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE osobo_user SET timezone TO 'Europe/Moscow';
GRANT ALL PRIVILEGES ON DATABASE osobo_web TO osobo_user;
\q
```

### Установка Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Установка PM2 (управление процессами)
```bash
sudo npm install -g pm2
pm2 --version
```

---

## 2️⃣ Загрузка проекта

### Создание директории
```bash
mkdir -p /home/osobo-web
cd /home/osobo-web
```

### Вариант 1: Загрузка через Git (рекомендуется)
```bash
git clone https://github.com/your-username/osobo-web.git .
```

### Вариант 2: Загрузка через SCP
С локальной машины:
```bash
scp -r C:\VeryTasty\apps user@your-server-ip:/home/osobo-web/
```

### Вариант 3: Загрузка через rsync
```bash
rsync -avz -e ssh C:\VeryTasty\apps\ user@your-server-ip:/home/osobo-web/apps/
```

---

## 3️⃣ Настройка Backend (Django)

### Создание виртуального окружения
```bash
cd /home/osobo-web/apps/api
python3.10 -m venv venv
source venv/bin/activate
```

### Установка зависимостей
```bash
pip install -r requirements.txt
```

### Создание файла .env
```bash
nano .env
```

Содержимое `.env`:
```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-domain.com,localhost,127.0.0.1
DATABASE_URL=postgres://osobo_user:secure_password@localhost:5432/osobo_web
# Или для SQLite:
# DATABASE_URL=sqlite:///db.sqlite3
```

Генерация секретного ключа:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Настройка настроек Django для production

Файл: `apps/api/api/settings/production.py` (создайте новый):
```python
from .base import *  # noqa: F401,F403

DEBUG = False
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DATABASE_NAME', 'osobo_web'),
        'USER': os.environ.get('DATABASE_USER', 'osobo_user'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD', ''),
        'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
        'PORT': os.environ.get('DATABASE_PORT', '5432'),
    }
}

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS
CORS_ALLOWED_ORIGINS = [
    'https://your-domain.com',
]
```

### Обновление urls.py для production
Добавьте в `api/urls.py`:
```python
# Production settings
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Static files
    import os
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

### Применение миграций
```bash
python manage.py migrate
```

### Сборка статических файлов
```bash
python manage.py collectstatic --noinput
```

### Создание суперпользователя
```bash
python manage.py createsuperuser
```

### Создание тестовых данных (опционально)
```bash
python manage.py create_test_loyalty
```

---

## 4️⃣ Настройка Frontend (Next.js)

### Установка зависимостей
```bash
cd /home/osobo-web/apps/web
npm install
```

### Создание .env.local
```bash
nano .env.local
```

Содержимое `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
# Или для IP:
# NEXT_PUBLIC_API_URL=http://your-server-ip:8000/api
```

### Сборка проекта
```bash
npm run build
```

### Запуск через PM2
```bash
pm2 start npm --name "osobo-web-frontend" -- start
pm2 save
pm2 startup
```

---

## 5️⃣ Настройка Backend через PM2

### Запуск Django через Gunicorn
```bash
cd /home/osobo-web/apps/api
pip install gunicorn
```

### Создание файла запуска
```bash
nano /home/osobo-web/apps/api/start.sh
```

Содержимое `start.sh`:
```bash
#!/bin/bash
cd /home/osobo-web/apps/api
source venv/bin/activate
gunicorn api.wsgi:application --workers 4 --bind 127.0.0.1:8000 --timeout 120
```

```bash
chmod +x start.sh
```

### Запуск через PM2
```bash
pm2 start start.sh --name "osobo-web-backend"
pm2 save
```

---

## 6️⃣ Настройка Nginx

### Создание конфига
```bash
sudo nano /etc/nginx/sites-available/osobo-web
```

Содержимое:
```nginx
server {
    listen 80;
    server_name your-domain.com your-server-ip;

    # Next.js (Frontend)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Django API (Backend)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (Django)
    location /static/ {
        alias /home/osobo-web/apps/api/staticfiles/;
    }

    # Media files (Django)
    location /media/ {
        alias /home/osobo-web/apps/api/media/;
    }
}
```

### Активация конфига
```bash
sudo ln -s /etc/nginx/sites-available/osobo-web /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7️⃣ SSL сертификат (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 8️⃣ Проверка работы

### Проверка сервисов
```bash
# Nginx
sudo systemctl status nginx

# PM2 процессы
pm2 status

# Django
curl http://localhost:8000/api/menu/items/

# Next.js
curl http://localhost:3000
```

### Проверка логов
```bash
# PM2 логи
pm2 logs

# Nginx логи
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 9️⃣ Автоматический запуск при перезагрузке

```bash
pm2 startup
pm2 save
```

---

## 🔟 Мониторинг и обслуживание

### Проверка дискового пространства
```bash
df -h
```

### Очистка старых логов
```bash
sudo journalctl --vacuum-time=7d
```

### Обновление проекта
```bash
cd /home/osobo-web
git pull

# Backend
cd apps/api
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Frontend
cd ../../apps/web
npm install
npm run build
pm2 restart osobo-web-frontend
```

---

## 🆘 Возможные проблемы и решения

### 1. Ошибка 502 Bad Gateway
**Причина:** Gunicorn или Next.js не запущены
**Решение:**
```bash
pm2 status
pm2 logs
pm2 restart all
```

### 2. Ошибка CORS
**Причина:** Неправильные настройки CORS
**Решение:** Проверьте `CORS_ALLOWED_ORIGINS` в настройках Django

### 3. Статика не загружается
**Причина:** Nginx не раздаёт статические файлы
**Решение:**
```bash
python manage.py collectstatic --noinput
sudo systemctl restart nginx
```

### 4. База данных не подключается
**Причина:** Неправильные настройки DATABASE_URL
**Решение:** Проверьте `.env` файл и настройки PostgreSQL

### 5. Память заканчивается
**Причина:** Слишком много workers
**Решение:** Уменьшите количество workers в Gunicorn
```bash
nano start.sh
# Измените --workers 4 на --workers 2
pm2 restart osobo-web-backend
```

---

## 📊 Полезные команды

```bash
# Проверка статуса всех сервисов
pm2 status

# Перезапуск всех сервисов
pm2 restart all

# Остановка всех сервисов
pm2 stop all

# Просмотр логов
pm2 logs

# Обновление проекта
cd /home/osobo-web && git pull

# Проверка Nginx
sudo nginx -t
sudo systemctl reload nginx

# Проверка SSL
certbot certificates
```

---

## ✅ Финальная проверка

- [ ] Сервер запущен и доступен по IP
- [ ] Домен настроен и указывает на сервер
- [ ] SSL сертификат установлен
- [ ] Backend API доступен по `/api/`
- [ ] Frontend доступен по домену
- [ ] Авторизация работает (OTP)
- [ ] Корзина работает
- [ ] QR-код генерируется
- [ ] Заказы создаются
- [ ] PM2 автозапуск настроен
- [ ] Логирование настроено

---

## 💡 Рекомендации

1. **Используйте PostgreSQL** вместо SQLite для production
2. **Настройте backup** базы данных ежедневно
3. **Используйте CI/CD** (GitHub Actions) для автоматического деплоя
4. **Настройте мониторинг** (PM2 monitor, New Relic, etc.)
5. **Используйте .env** для всех секретных ключей
6. **Включите firewall** (UFW) и откройте только 80, 443, 22 порты
7. **Настройте fail2ban** для защиты от brute-force

---

## 🔒 Безопасность

```bash
# Включение firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Установка fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

---

Готово! 🎉

Ваш проект "Особо Вкусно" должен быть доступен по адресу:
- **HTTP:** http://your-server-ip
- **HTTPS:** https://your-domain.com
- **API:** https://your-domain.com/api/

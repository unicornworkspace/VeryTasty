#!/bin/bash

# ============================================================================
# АВТОМАТИЧЕСКАЯ НАСТРОЙКА СЕРВЕРА ДЛЯ "ОСОБО ВКУСНО"
# ============================================================================
# Инструкция:
# 1. Скопируйте этот файл на сервер: scp setup.sh root@200.169.182.253:~
# 2. Выполните: bash setup.sh
# ============================================================================

set -e  # Выход при ошибке

echo "=========================================="
echo "  НАСТРОЙКА СЕРВЕРА: ОСОБО ВКУСНО"
echo "=========================================="
echo ""

# ============================================================================
# ШАГ 1: Обновление системы
# ============================================================================
echo "[1/10] Обновление системы..."
apt update && apt upgrade -y

# ============================================================================
# ШАГ 2: Установка базовых утилит
# ============================================================================
echo "[2/10] Установка базовых утилит..."
apt install -y curl wget git unzip nano htop ufw

# ============================================================================
# ШАГ 3: Установка Python 3.12+
# ============================================================================
echo "[3/10] Установка Python 3.12..."
apt install -y python3 python3-venv python3-dev python3-pip

# Проверяем версию
PYTHON_VERSION=$(python3 --version)
echo "✓ Python установлен: $PYTHON_VERSION"

# ============================================================================
# ШАГ 4: Установка Node.js 18+
# ============================================================================
echo "[4/10] Установка Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Проверяем версию
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✓ Node.js установлен: $NODE_VERSION"
echo "✓ npm установлен: $NPM_VERSION"

# ============================================================================
# ШАГ 5: Установка PostgreSQL
# ============================================================================
echo "[5/10] Установка PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Запускаем PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Создаём базу данных и пользователя
echo "Создание базы данных и пользователя..."
sudo -u postgres psql <<EOF
CREATE DATABASE osobo_web;
CREATE USER osobo_user WITH PASSWORD 'Osobo2024!Secure';
ALTER ROLE osobo_user SET client_encoding TO 'utf8';
ALTER ROLE osobo_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE osobo_user SET timezone TO 'Europe/Moscow';
GRANT ALL PRIVILEGES ON DATABASE osobo_web TO osobo_user;
EOF

echo "✓ PostgreSQL настроен"

# ============================================================================
# ШАГ 6: Установка Nginx
# ============================================================================
echo "[6/10] Установка Nginx..."
apt install -y nginx

systemctl start nginx
systemctl enable nginx
echo "✓ Nginx установлен"

# ============================================================================
# ШАГ 7: Установка PM2
# ============================================================================
echo "[7/10] Установка PM2..."
npm install -g pm2
echo "✓ PM2 установлен"

# ============================================================================
# ШАГ 8: Настройка Firewall (UFW)
# ============================================================================
echo "[8/10] Настройка Firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
echo "y" | ufw enable
echo "✓ Firewall настроен"

# ============================================================================
# ШАГ 9: Создание директории проекта
# ============================================================================
echo "[9/10] Создание структуры проекта..."
mkdir -p /home/osobo-web/apps
cd /home/osobo-web

# Создаём .gitconfig для удобства
git config --global user.email "deploy@osobovkusno.ru"
git config --global user.name "Deploy Script"

echo "✓ Структура создана: /home/osobo-web"

# ============================================================================
# ШАГ 10: Создание вспомогательных файлов
# ============================================================================
echo "[10/10] Создание вспомогательных файлов..."

# Создаём скрипт для деплоя проекта
cat > /home/osobo-web/deploy.sh <<'DEPLOY_SCRIPT'
#!/bin/bash
# Скрипт деплоя проекта после загрузки кода

set -e

echo "=== НАЧАЛО ДЕПЛОЯ ==="

# Backend
echo "Настройка Backend..."
cd /home/osobo-web/apps/api

# Создаём venv
python3.10 -m venv venv
source venv/bin/activate

# Устанавливаем зависимости
pip install -r requirements.txt

# Настраиваем .env
cat > .env <<EOF
DJANGO_SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=*,localhost,127.0.0.1
DATABASE_URL=postgres://osobo_user:Osobo2024!Secure@localhost:5432/osobo_web
EOF

# Применяем миграции
python manage.py migrate --noinput

# Собираем статику
python manage.py collectstatic --noinput

# Создаём суперпользователя (если не существует)
python manage.py shell <<'PYTHON'
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@osobovkusno.ru', 'Admin2024!')
    print("✓ Суперпользователь admin создан")
PYTHON

# Frontend
echo "Настройка Frontend..."
cd /home/osobo-web/apps/web

# Устанавливаем зависимости
npm install

# Создаём .env.local
cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EOF

# Собираем проект
npm run build

echo "=== ДЕПЛОЙ ЗАВЕРШЕН ==="
echo ""
echo "Запуск сервисов через PM2..."

# Запускаем Backend через Gunicorn
cd /home/osobo-web/apps/api
source venv/bin/activate
pip install gunicorn -q

cat > start-backend.sh <<'BACKEND_SCRIPT'
#!/bin/bash
cd /home/osobo-web/apps/api
source venv/bin/activate
exec gunicorn api.wsgi:application --workers 4 --bind 127.0.0.1:8000 --timeout 120
BACKEND_SCRIPT

chmod +x start-backend.sh

# Запускаем через PM2
pm2 delete osobo-web-backend 2>/dev/null || true
pm2 delete osobo-web-frontend 2>/dev/null || true

pm2 start start-backend.sh --name "osobo-web-backend"
pm2 start npm --name "osobo-web-frontend" -- start

# Сохраняем и настраиваем автозапуск
pm2 save
pm2 startup

echo ""
echo "✓ Backend запущен на порту 8000"
echo "✓ Frontend запущен на порту 3000"
echo ""
echo "Настройка Nginx..."
DEPLOY_SCRIPT

chmod +x /home/osobo-web/deploy.sh

# Создаём конфиг Nginx
cat > /etc/nginx/sites-available/osobo-web <<'NGINX_CONF'
server {
    listen 80;
    server_name _;

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
NGINX_CONF

# Активируем конфиг
ln -sf /etc/nginx/sites-available/osobo-web /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "✓ Nginx настроен"

# ============================================================================
# ФИНАЛ
# ============================================================================
echo ""
echo "=========================================="
echo "  ✓ БАЗОВАЯ НАСТРОЙКА ЗАВЕРШЕНА!"
echo "=========================================="
echo ""
echo "Следующие шаги:"
echo "1. Загрузите код проекта:"
echo "   cd /home/osobo-web"
echo "   git clone https://ваш-repo.git ."
echo "   ИЛИ"
echo "   scp -r ./apps root@200.169.182.253:/home/osobo-web/"
echo ""
echo "2. Запустите деплой:"
echo "   bash /home/osobo-web/deploy.sh"
echo ""
echo "3. Проверьте работу:"
echo "   curl http://localhost"
echo "   curl http://localhost/api/menu/items/"
echo ""
echo "=========================================="
echo ""
echo "Статус сервисов:"
echo "  PM2:        pm2 status"
echo "  Nginx:      systemctl status nginx"
echo "  PostgreSQL: systemctl status postgresql"
echo ""
echo "Логи:"
echo "  PM2:        pm2 logs"
echo "  Nginx:      tail -f /var/log/nginx/error.log"
echo ""

#!/bin/bash
# ============================================================================
# ПОЛНАЯ АВТОМАТИЧЕСКАЯ НАСТРОЙКА СЕРВЕРА "ОСОБО ВКУСНО"
# ============================================================================
# Инструкция:
# 1. scp этот-файл.sh root@200.169.182.253:~
# 2. bash этот-файл.sh
# 3. Дождаться окончания (10-15 минут)
# ============================================================================

set -e

echo "=========================================="
echo "  ОСОБО ВКУСНО - АВТОМАТИЧЕСКАЯ НАСТРОЙКА"
echo "=========================================="
echo ""

# ============================================================================
# ШАГ 1: Обновление и базовые утилиты
# ============================================================================
echo "[1/8] Обновление системы..."
apt update -y && apt upgrade -y
apt install -y curl wget git unzip nano htop ufw python3 python3-venv python3-dev python3-pip

echo "✓ Система обновлена"

# ============================================================================
# ШАГ 2: Node.js 18+
# ============================================================================
echo "[2/8] Установка Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2

echo "✓ Node.js: $(node --version)"
echo "✓ PM2: $(pm2 --version)"

# ============================================================================
# ШАГ 3: PostgreSQL
# ============================================================================
echo "[3/8] Установка PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql <<'EOSQL'
CREATE DATABASE osobo_web;
CREATE USER osobo_user WITH PASSWORD 'Osobo2024!Secure';
ALTER ROLE osobo_user SET client_encoding TO 'utf8';
ALTER ROLE osobo_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE osobo_user SET timezone TO 'Europe/Moscow';
GRANT ALL PRIVILEGES ON DATABASE osobo_web TO osobo_user;
EOSQL

echo "✓ PostgreSQL настроен"

# ============================================================================
# ШАГ 4: Nginx
# ============================================================================
echo "[4/8] Устан��вка Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Конфиг Nginx
cat > /etc/nginx/sites-available/osobo-web <<'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /home/osobo-web/apps/api/staticfiles/;
    }

    location /media/ {
        alias /home/osobo-web/apps/api/media/;
    }
}
EOF

ln -sf /etc/nginx/sites-available/osobo-web /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "✓ Nginx настроен"

# ============================================================================
# ШАГ 5: Firewall
# ============================================================================
echo "[5/8] Настройка Firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo "✓ Firewall настроен"

# ============================================================================
# ШАГ 6: Структура проекта
# ============================================================================
echo "[6/8] Создание структуры проекта..."
mkdir -p /home/osobo-web/apps
cd /home/osobo-web

echo "✓ Структура создана"

# ============================================================================
# ШАГ 7: Создание скрипта деплоя
# ============================================================================
echo "[7/8] Создание скрипта деплоя..."

cat > /home/osobo-web/deploy-project.sh <<'DEPLOY'
#!/bin/bash
set -e

echo "=========================================="
echo "  ЗАГРУЗКА И НАСТРОЙКА ПРОЕКТА"
echo "=========================================="
echo ""

# Проверка наличия кода
if [ ! -d "/home/osobo-web/apps/api" ] || [ ! -f "/home/osobo-web/apps/api/manage.py" ]; then
    echo "⚠️  Код проекта не найден!"
    echo ""
    echo "Следующие шаги:"
    echo ""
    echo "Вариант 1: Через Git"
    echo "  cd /home/osobo-web"
    echo "  git clone https://github.com/USERNAME/REPO.git ."
    echo ""
    echo "Вариант 2: Через SCP (с вашего компьютера)"
    echo "  tar -czf osobo-web.tar.gz --exclude='node_modules' --exclude='venv' --exclude='.git' apps/"
    echo "  scp osobo-web.tar.gz root@200.169.182.253:~"
    echo "  cd /home/osobo-web && tar -xzf osobo-web.tar.gz"
    echo ""
    echo "После загрузки кода выполните:"
    echo "  bash /home/osobo-web/deploy-project.sh"
    echo ""
    echo "=========================================="
    exit 1
fi

echo "✓ Код проекта найден"
echo ""

# ============================================================================
# BACKEND
# ============================================================================
echo "[1/4] Настройка Backend (Django)..."
cd /home/osobo-web/apps/api

# Virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

# Environment
if [ ! -f ".env" ]; then
    SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
    cat > .env <<EOF
DJANGO_SECRET_KEY=${SECRET_KEY}
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=*,localhost,127.0.0.1
DATABASE_URL=postgres://osobo_user:Osobo2024!Secure@localhost:5432/osobo_web
EOF
    echo "✓ .env создан"
fi

# Migrations
python manage.py migrate --noinput
echo "✓ Миграции применены"

# Static files
python manage.py collectstatic --noinput
echo "✓ Статика собрана"

# Superuser
python manage.py shell <<'PYTHON'
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@osobovkusno.ru', 'Admin2024!')
    print('✓ Суперпользователь admin создан')
PYTHON

# ============================================================================
# FRONTEND
# ============================================================================
echo ""
echo "[2/4] Настройка Frontend (Next.js)..."
cd /home/osobo-web/apps/web

if [ ! -d "node_modules" ]; then
    npm install
fi

cat > .env.local <<'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EOF

npm run build
echo "✓ Frontend собран"

# ============================================================================
# ЗАПУСК
# ============================================================================
echo ""
echo "[3/4] Запуск сервисов..."

# Gunicorn
cd /home/osobo-web/apps/api
pip install gunicorn -q

cat > start-backend.sh <<'BACKEND'
#!/bin/bash
cd /home/osobo-web/apps/api
source venv/bin/activate
exec gunicorn api.wsgi:application --workers 4 --bind 127.0.0.1:8000 --timeout 120
BACKEND

chmod +x start-backend.sh

# PM2
pm2 delete osobo-web-backend 2>/dev/null || true
pm2 delete osobo-web-frontend 2>/dev/null || true

pm2 start start-backend.sh --name "osobo-web-backend"
pm2 start npm --name "osobo-web-frontend" -- start

pm2 save
pm2 startup 2>/dev/null || true

echo "✓ Backend: http://localhost:8000"
echo "✓ Frontend: http://localhost:3000"

# ============================================================================
# ФИНАЛ
# ============================================================================
echo ""
echo "[4/4] Финальная проверка..."
echo ""
echo "=========================================="
echo "  ✓ НАСТРОЙКА ЗАВЕРШЕНА!"
echo "=========================================="
echo ""
echo "Доступы:"
echo "  Фронтенд: http://200.169.182.253"
echo "  API:      http://200.169.182.253/api/"
echo "  Админка:  http://200.169.182.253/admin/"
echo "            Логин: admin"
echo "            Пароль: Admin2024!"
echo ""
echo "Тестовый аккаунт:"
echo "  Телефон: +79991234567"
echo "  Код:     000000"
echo ""
echo "Команды:"
echo "  Статус:   pm2 status"
echo "  Логи:     pm2 logs"
echo "  Перезапуск: pm2 restart all"
echo ""
echo "=========================================="
DEPLOY

chmod +x /home/osobo-web/deploy-project.sh

echo "✓ Скрипт деплоя создан"

# ============================================================================
# ФИНАЛ
# ============================================================================
echo ""
echo "=========================================="
echo "  ✓ БАЗОВАЯ НАСТРОЙКА ЗАВЕРШЕНА!"
echo "=========================================="
echo ""
echo "Следующий шаг:"
echo ""
echo "1. Загрузите код проекта (ОДИН из способов):"
echo ""
echo "   Способ A: Через Git"
echo "   cd /home/osobo-web"
echo "   git clone https://github.com/ВАШ_РЕПОЗИТОРИЙ.git ."
echo ""
echo "   Способ B: Через SCP"
echo "   На вашем компьютере:"
echo "     tar -czf osobo-web.tar.gz --exclude='node_modules' --exclude='venv' --exclude='.git' apps/"
echo "     scp osobo-web.tar.gz root@200.169.182.253:~"
echo "   На сервере:"
echo "     cd /home/osobo-web"
echo "     tar -xzf osobo-web.tar.gz"
echo ""
echo "2. Запустите деплой:"
echo "   bash /home/osobo-web/deploy-project.sh"
echo ""
echo "=========================================="

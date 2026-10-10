# 🚀 ФИНАЛЬНАЯ ИНСТРУКЦИЯ ПО ДЕПЛОЮ

## 📋 Текущее состояние
- ✅ Все изменения закоммичены
- ✅ Последняя версия в Git (10 часов назад)
- ✅ Сервер настроен (Python, Node.js, PostgreSQL, Nginx, PM2)

---

## 1️⃣ Загрузка кода на сервер

### Вариант A: Через Git (рекомендуется)

```bash
# На сервере
cd /home/osobo-web
git clone https://ваш-repo-url.git .
```

### Вариант B: Через SCP (без Git)

**На вашем компьютере (PowerShell):**

```powershell
# Сжатый архив
cd C:\VeryTasty
tar -czf osobo-web.tar.gz --exclude='apps/web/node_modules' --exclude='apps/api/venv' --exclude='.git' apps/

# Загрузка на сервер
scp osobo-web.tar.gz root@200.169.182.253:~
```

**На сервере:**

```bash
cd /home/osobo-web
tar -xzf osobo-web.tar.gz
rm osobo-web.tar.gz
```

---

## 2️⃣ Запуск деплоя

```bash
# На сервере
cd /home/osobo-web
bash deploy.sh
```

Скрипт сделает:
1. ✅ Backend: venv, pip install, migrate, collectstatic
2. ✅ Frontend: npm install, npm run build
3. ✅ Запуск через PM2
4. ✅ Nginx настроен

---

## 3️⃣ Проверка

```bash
# Проверка сервисов
pm2 status
systemctl status nginx

# Проверка API
curl http://localhost/api/menu/items/

# Проверка фронтенда
curl http://localhost
```

---

## 4️⃣ Создание тестовых данных

```bash
cd /home/osobo-web/apps/api
source venv/bin/activate
python manage.py create_test_loyalty
```

---

## 5️⃣ Доступы

- **Бэкенд API:** http://200.169.182.253/api/
- **Фронтенд:** http://200.169.182.253
- **Админка:** http://200.169.182.253/admin/
  - Логин: admin
  - Пароль: Admin2024!

---

## 🆘 Если что-то пошло не так

```bash
# Логи PM2
pm2 logs

# Логи Nginx
tail -f /var/log/nginx/error.log

# Перезапуск всех сервисов
pm2 restart all

# Проверка PostgreSQL
systemctl status postgresql
sudo -u postgres psql -c "\l"
```

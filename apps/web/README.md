# Особо Вкусно — Веб-приложение

Современный веб-интерфейс для ресторана «Особо Вкусно» с функциями меню, акций, программы лояльности и оформления заявок.

## Стек

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** — state management
- **SWR** — data fetching
- **Zod** — validation

## Структура проекта

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Главная (/)
│   │   ├── menu/page.tsx       # Меню (/menu)
│   │   ├── promo/page.tsx      # Акции (/promo)
│   │   ├── club/page.tsx       # Клуб гостей (/club)
│   │   ├── contacts/page.tsx   # Контакты (/contacts)
│   │   ├── checkout/page.tsx   # Оформление заявки (/checkout)
│   │   └── admin/              # Админ-панель (/admin)
│   ├── components/             # React компоненты
│   │   ├── layout/             # Header, Footer, AdminSidebar
│   │   ├── ui/                 # Button, Card, Input, Tabs, и т.д.
│   │   ├── menu/               # DishCard, CategoryTabs
│   │   ├── club/               # GuestCard, QRCode
│   │   └── checkout/           # CartItem, ContactForm
│   ├── lib/                    # Утилиты, типы, API клиент
│   ├── stores/                 # Zustand stores (cart, toast)
│   ├── hooks/                  # Кастомные хуки (auth, API, phone mask)
│   └── styles/                 # globals.css с design tokens
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Установка

```bash
# Перейти в директорию веб-приложения
cd apps/web

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
```

Открыть http://localhost:3000

## Скрипты

```bash
npm run dev       # Запуск dev-сервера
npm run build     # Production build
npm run start     # Запуск production сервера
npm run lint      # ESLint проверка
```

## API Backend

Веб-приложение интегрируется с Django backend по адресу `http://localhost:8000/api`.

Для указания другого адреса API создайте файл `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Основные функции

### Публичные страницы
- **Главная** — hero-блок, избранные блюда, превью карты гостя, акции
- **Меню** — поиск, категории, карточки блюд, добавление в корзину
- **Акции** — баннеры, промокоды, сетка акций
- **Контакты** — адрес, часы работы, форма обратной связи

### Авторизованные страницы
- **Клуб гостей** — баланс бонусов, QR-код, история операций
- **Оформление заявки** — корзина, форма контактов, отправка заказа

### Админ-панель
- Дашборд со статистикой
- Управление заявками, меню, акциями
- Создание новых акций с превью

## Дизайн-токены

Цветовая схема определена в `src/styles/globals.css`:

- **Акцент**: `#C96F4A` (тёплый терракотовый)
- **Фон светлый**: `#F5F3EF`
- **Фон тёмный**: `#1E1E1E`
- **Карточка тёмная**: `#1F2A24`

Типографика: Inter + Manrope (Google Fonts)

## Адаптивность

Mobile-first подход:
- Mobile S: 320–479px
- Mobile L: 480–767px
- Tablet: 768–1023px
- Desktop: 1024px+

## Доступность

- WCAG 2.1 AA compliance
- Keyboard navigation (Tab, Enter, Esc)
- ARIA labels и roles
- Focus visible outlines
- Контраст текста ≥ 4.5:1

## Лицензия

© 2026 Особо Вкусно. Все права защищены.

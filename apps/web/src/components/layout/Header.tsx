'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/stores/cart-store';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { LoginModal } from '@/components/ui/LoginModal';

/**
 * Навигационные ссылки для десктопа
 */
const navLinks = [
  { href: '/menu', label: 'Меню' },
  { href: '/promo', label: 'Акции' },
  { href: '/club', label: 'Клуб гостей' },
  { href: '/orders', label: 'Заказы' },
  { href: '/contacts', label: 'Контакты' },
];

/**
 * Компонент шапки сайта
 * Содержит логотип, навигацию, переключатель темы, корзину и кнопку входа
 */
export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Получаем items напрямую
  const items = useCart((state) => state.items);
  
  // Вычисляем itemCount и total напрямую из items
  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }, [items]);
  
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [items]);

  // Проверяем, что корзина инициализирована
  useEffect(() => {
    setCartReady(true);
    console.log('[HEADER] Cart ready, itemCount:', itemCount);
  }, [itemCount]);

  // Отслеживаем скролл для тени
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debug
  useEffect(() => {
    console.log('[HEADER] Items:', items);
    console.log('[HEADER] itemCount:', itemCount);
    console.log('[HEADER] total:', total);
    console.log('[HEADER] Showing cart:', cartReady && itemCount > 0);
  }, [items, itemCount, total, cartReady]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 bg-bg-light/95 backdrop-blur-sm transition-shadow duration-200',
          isScrolled && 'shadow-lg'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-bold text-h3 md:text-h2 text-text-primary hidden sm:block">
              Особо Вкусно
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-small font-medium transition-colors duration-150 hover:text-accent',
                  pathname === link.href && 'text-accent'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 cursor-pointer rounded-lg hover:bg-bg-dark hover:bg-opacity-10 transition-colors"
              aria-label="Сменить тему"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Корзина — показываем всегда когда есть товары */}
            {cartReady && itemCount > 0 && (
              <Link
                href="/checkout"
                className="flex items-center gap-2 bg-accent text-text-inverse px-4 py-2 rounded-lg font-semibold text-small hover:bg-accent-hover transition-colors shadow-md hover:shadow-lg cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-bold">{itemCount}</span>
                <span className="hidden xl:inline">·</span>
                <span className="hidden xl:inline">
                  {new Intl.NumberFormat('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 0,
                  }).format(total)}
                </span>
              </Link>
            )}

            {/* Auth Button */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-small font-medium text-text-primary hover:text-accent transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden lg:inline">{user.name || 'Профиль'}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 bg-surface rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] border border-border">
                  <div className="p-2 space-y-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 rounded-lg text-small hover:bg-bg-light transition-colors"
                    >
                      Профиль
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2.5 rounded-lg text-small hover:bg-bg-light transition-colors"
                    >
                      Мои заказы
                    </Link>
                    <Link
                      href="/club"
                      className="block px-4 py-2.5 rounded-lg text-small hover:bg-bg-light transition-colors"
                    >
                      Карта гостя
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-small hover:bg-bg-light transition-colors cursor-pointer text-error"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-accent text-text-inverse px-5 py-2.5 rounded-lg font-semibold text-small hover:bg-accent-hover transition-colors shadow-md hover:shadow-lg"
              >
                Войти
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 cursor-pointer rounded-lg hover:bg-bg-dark hover:bg-opacity-10 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Открыть меню"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-bg-light shadow-2xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-h3 text-text-primary">Меню</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 cursor-pointer rounded-lg hover:bg-bg-dark hover:bg-opacity-10 transition-colors"
                  aria-label="Закрыть меню"
                >
                  <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <nav className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-3 rounded-lg text-body font-medium transition-colors duration-150 hover:bg-bg-dark hover:text-text-inverse',
                    pathname === link.href && 'bg-accent text-text-inverse'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Корзина в мобильном меню */}
              {itemCount > 0 && (
                <Link
                  href="/checkout"
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-accent text-text-inverse font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Корзина</span>
                  <span className="text-small">
                    {itemCount} · {new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      minimumFractionDigits: 0,
                    }).format(total)}
                  </span>
                </Link>
              )}

              <div className="border-t border-border mt-2 pt-2 space-y-2">
                {/* Theme Toggle в мобильном меню */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-body hover:bg-bg-dark hover:text-text-inverse transition-colors"
                >
                  <span>{theme === 'light' ? '🌙 Тёмная тема' : '☀️ Светлая тема'}</span>
                </button>

                {user ? (
                  <>
                    <Link
                      href="/orders"
                      className="px-4 py-3 rounded-lg text-body hover:bg-bg-dark hover:text-text-inverse transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Мои заказы
                    </Link>
                    <Link
                      href="/club"
                      className="px-4 py-3 rounded-lg text-body hover:bg-bg-dark hover:text-text-inverse transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Карта гостя
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg text-body hover:bg-bg-dark hover:text-text-inverse transition-colors text-error cursor-pointer"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg bg-accent text-text-inverse font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    Войти
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}

/**
 * Футер сайта
 * Содержит навигацию, контакты и юридическую информацию
 */
export function Footer() {
  return (
    <footer className="bg-bg-dark text-text-inverse mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div>
            <span className="font-bold text-h3">Особо Вкусно</span>
            <p className="text-small text-text-muted mt-3 leading-relaxed">
              С огня — к вашему столу. Современная кухня и лучшие ингредиенты.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-small mb-4 uppercase tracking-wider">Навигация</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/menu" className="text-small text-text-muted hover:text-text-inverse transition-colors">
                  Меню
                </Link>
              </li>
              <li>
                <Link href="/promo" className="text-small text-text-muted hover:text-text-inverse transition-colors">
                  Акции
                </Link>
              </li>
              <li>
                <Link href="/club" className="text-small text-text-muted hover:text-text-inverse transition-colors">
                  Клуб гостей
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-small mb-4 uppercase tracking-wider">Контакты</h4>
            <ul className="space-y-3 text-small text-text-muted">
              <li>г. Москва, ул. Примерная, д. 1</li>
              <li>
                <a href="tel:+79991234567" className="hover:text-text-inverse transition-colors">
                  +7 (999) 123-45-67
                </a>
              </li>
              <li>
                <a href="mailto:info@osobovkusno.ru" className="hover:text-text-inverse transition-colors">
                  info@osobovkusno.ru
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-small mb-4 uppercase tracking-wider">Документы</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-small text-text-muted hover:text-text-inverse transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-small text-text-muted hover:text-text-inverse transition-colors">
                  Пользовательское соглашение
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white border-opacity-10 mt-10 pt-8 text-center">
          <p className="text-small text-text-muted">
            © {new Date().getFullYear()} Особо Вкусно. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}

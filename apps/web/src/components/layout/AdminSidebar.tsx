'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/admin', label: 'Дашборд', icon: '📊' },
  { href: '/admin/orders', label: 'Заявки', icon: '📋' },
  { href: '/admin/menu', label: 'Меню', icon: '📖' },
  { href: '/admin/promo', label: 'Акции', icon: '🎁' },
  { href: '/admin/loyalty', label: 'Лояльность', icon: '💳' },
  { href: '/admin/guests', label: 'Гости', icon: '👥' },
  { href: '/admin/stats', label: 'Статистика', icon: '📈' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-bg-dark text-text-inverse min-h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-white border-opacity-10">
        <Link href="/" className="font-bold text-h3 hover:text-accent transition-colors">
          Особо Вкусно
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-sm text-small font-medium transition-colors duration-150',
                'hover:bg-white hover:bg-opacity-8',
                isActive && 'bg-accent text-text-inverse'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 md:p-6 border-t border-white border-opacity-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-small font-bold">
            В
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-small font-semibold truncate">Владелец</p>
            <p className="text-caption text-text-muted">owner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

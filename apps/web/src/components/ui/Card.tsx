'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/lib/types';

/**
 * Компонент карточки блюда в меню
 * @param item - данные блюда из API
 * @param onAdd - callback при добавлении в корзину
 * @param className - дополнительные Tailwind классы
 */
interface DishCardProps {
  item: MenuItem;
  onAdd?: () => void;
  className?: string;
}

export function DishCard({ item, onAdd, className }: DishCardProps) {
  // Форматируем цену в рубли
  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(item.price));

  // Получаем путь к изображению
  const imageUrl = item.image_url || '';

  return (
    <div
      className={cn(
        'group bg-surface rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-border',
        className
      )}
    >
      {/* Изображение блюда */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-bg-light to-bg-dark overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary">
            <svg
              className="w-16 h-16 mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-caption">Нет фото</span>
          </div>
        )}

        {/* Бейдж стоп-листа */}
        {item.stop_list && (
          <div className="absolute top-3 left-3 bg-error text-text-inverse text-caption font-semibold px-3 py-1 rounded-full">
            Нет в наличии
          </div>
        )}
      </div>

      {/* Контент карточки */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Название блюда */}
        <div>
          <h3 className="font-bold text-text-primary text-body sm:text-h3 leading-tight mb-1">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-text-secondary text-small line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Вес/объём */}
        <div className="flex items-center gap-2 text-text-secondary">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span className="text-small font-medium">
            {item.quantity} {item.unit}
          </span>
        </div>

        {/* Цена и кнопка добавления */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex flex-col">
            <span className="text-text-secondary text-caption">Цена</span>
            <span className="font-bold text-accent text-h3 sm:text-h2">
              {formattedPrice}
            </span>
          </div>

          {onAdd && (
            <button
              onClick={onAdd}
              className={cn(
                'bg-accent hover:bg-accent-hover active:bg-accent-pressed',
                'text-text-inverse font-bold rounded-lg',
                'transition-all duration-200',
                'flex items-center gap-2',
                'px-4 py-3 sm:px-5 sm:py-3.5',
                'hover:scale-105 active:scale-95',
                'shadow-md hover:shadow-lg'
              )}
              aria-label={`Добавить ${item.name} в заявку`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm sm:text-body font-semibold">В заявку</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Тёмная карточка для акций, промокодов и превью карты гостя
 */
interface DarkCardProps {
  children: React.ReactNode;
  className?: string;
}

export function DarkCard({ children, className }: DarkCardProps) {
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-bg-card-dark to-bg-dark text-text-inverse rounded-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-xl border border-white border-opacity-10',
        className
      )}
    >
      {children}
    </div>
  );
}

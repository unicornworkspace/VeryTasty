'use client';

import { useState, useMemo } from 'react';
import { DishCard } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { DishCardSkeleton } from '@/components/ui/Skeleton';
import { useMenuItems, useCategories } from '@/hooks/use-api';
import { useCart } from '@/stores/cart-store';
import { useToast } from '@/stores/toast-store';
import { formatPrice } from '@/lib/utils';
import type { MenuItem, Category } from '@/lib/types';

export default function MenuPage() {
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: itemsData, isLoading: itemsLoading } = useMenuItems();
  const { addItem } = useCart();
  const { add: addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const items = Array.isArray(itemsData) ? itemsData : [];

  const tabs = useMemo(
    () => [
      { label: 'Все', value: 'all' },
      ...categories.map((cat) => ({
        label: cat.name,
        value: cat.slug,
      })),
    ],
    [categories]
  );

  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => item.is_active && !item.stop_list);

    if (activeCategory !== 'all') {
      filtered = filtered.filter((item) =>
        item.categories.some((cat: Category) => cat.slug === activeCategory)
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [items, activeCategory, searchQuery]);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: parseFloat(item.price),
      unit: item.unit,
    });
    addToast({
      message: `${item.name} добавлен в заявку`,
      type: 'success',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-h1 md:text-[48px] font-bold text-text-primary">
          Меню
        </h1>

        <Input
          placeholder="Найти блюдо..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Поиск блюда"
        />
      </div>

      {/* Category Tabs */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categoriesLoading ? (
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-border rounded-pill animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        ) : (
          <Tabs
            tabs={tabs}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        )}
      </div>

      {/* Items Grid */}
      {itemsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <DishCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <DishCard
              key={item.id}
              item={item}
              onAdd={() => handleAddToCart(item)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <p className="text-body text-text-secondary">
            Ничего не найдено по вашему запросу
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="text-accent font-semibold body cursor-pointer hover:underline"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* Floating Checkout Button */}
      <FloatingCheckoutButton />
    </div>
  );
}

function FloatingCheckoutButton() {
  const { itemCount, total } = useCart();
  const { add: addToast } = useToast();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
      <a
        href="/checkout"
        className="pointer-events-auto bg-bg-dark text-text-inverse px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold body flex items-center gap-3"
      >
        <span>Заявка</span>
        <span className="bg-accent px-3 py-1 rounded-sm text-small">
          {itemCount} · {formatPrice(total)}
        </span>
      </a>
    </div>
  );
}

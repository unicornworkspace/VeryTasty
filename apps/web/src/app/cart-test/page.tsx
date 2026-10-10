'use client';

import { useCart } from '@/stores/cart-store';
import { Button } from '@/components/ui/Button';

export default function CartTest() {
  const { items, addItem, removeItem, updateQty, clear, total, itemCount } = useCart();

  const testItems = [
    { id: 999, name: 'Тестовое Блюдо', price: 500, unit: 'шт' },
    { id: 1000, name: 'Тестовый Напиток', price: 200, unit: 'шт' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-h2 font-bold">Корзина Тест</h1>

      {/* Cart State */}
      <div className="bg-surface p-4 rounded-lg space-y-2">
        <h2 className="text-h3 font-bold">Состояние корзины</h2>
        <p>Items count: {itemCount}</p>
        <p>Total: {total} руб</p>
        <p>Items: {JSON.stringify(items)}</p>
      </div>

      {/* Test Buttons */}
      <div className="space-y-2">
        <h3 className="font-bold">Добавить тестовые товары:</h3>
        {testItems.map((item) => (
          <Button
            key={item.id}
            onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price, unit: item.unit })}
          >
            + {item.name} ({item.price} руб)
          </Button>
        ))}
      </div>

      {/* Cart Items */}
      {items.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold">Товары в корзине:</h3>
          {items.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-text-muted">{item.price} руб × {item.qty} {item.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.menuItemId, item.qty - 1)}
                  className="px-3 py-1 border rounded cursor-pointer hover:bg-bg-light"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.menuItemId, item.qty + 1)}
                  className="px-3 py-1 border rounded bg-accent text-text-inverse cursor-pointer hover:bg-accent-hover"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="px-3 py-1 border rounded text-error cursor-pointer hover:bg-error hover:text-text-inverse"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Button */}
      {items.length > 0 && (
        <Button
          onClick={clear}
          variant="secondary"
          className="text-error"
        >
          Очистить корзину
        </Button>
      )}
    </div>
  );
}

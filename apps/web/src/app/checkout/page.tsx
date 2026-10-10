'use client';

import { useState } from 'react';
import { useCart } from '@/stores/cart-store';
import { useToast } from '@/stores/toast-store';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';
import { usePhoneMask } from '@/hooks/use-phone-mask';
import { CheckoutFormSchema } from '@/lib/validation';
import { formatPrice } from '@/lib/utils';
import { createOrder } from '@/lib/api-client';
import Link from 'next/link';

const STEPS = [
  { label: 'Выбрать' },
  { label: 'Отправить' },
  { label: 'Подтвердить' },
  { label: 'Готово' },
];

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { add: addToast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const name = useState(user?.name || '');
  const phone = usePhoneMask('');
  const comment = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      addToast({
        message: 'Корзина пуста',
        type: 'error',
      });
      return;
    }

    // Validate
    const result = CheckoutFormSchema.safeParse({
      name: name[0],
      phone: phone.value.replace(/\D/g, ''),
      comment: comment[0],
    });

    if (!result.success) {
      const firstError = result.error.errors[0];
      addToast({
        message: firstError.message,
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    setCurrentStep(1);

    try {
      // Реальный вызов API
      const orderItems = items.map((item) => ({
        menu_item: item.menuItemId,
        name_snapshot: item.name,
        price_snapshot: item.price.toString(),
        qty: item.qty,
      }));

      await createOrder({
        items: orderItems,
        comment: comment[0],
      });

      // Simulate API call delay for UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      setCurrentStep(3);
      addToast({
        message: 'Заявка отправлена! Мы свяжемся с вами для подтверждения.',
        type: 'success',
      });

      clear();
    } catch (error) {
      addToast({
        message: 'Ошибка отправки. Попробуйте позже.',
        type: 'error',
      });
      setCurrentStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && currentStep < 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 text-center space-y-4">
        <p className="text-body text-text-secondary">
          Ваша корзина пуста
        </p>
        <a
          href="/menu"
          className="inline-block bg-accent text-text-inverse px-6 py-3 rounded-sm font-semibold body hover:bg-accent-hover transition-colors"
        >
          Перейти в меню
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <h1 className="text-h1 md:text-[48px] font-bold text-text-primary">
          Оформление заявки
        </h1>

        <Stepper steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Cart Items */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <h2 className="text-h3 font-bold text-text-primary">
            Ваш заказ
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.menuItemId}
                item={item}
              />
            ))}
          </div>

          <div className="border-t border-border pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <span className="text-h3 font-bold text-text-primary">
                Итого:
              </span>
              <span className="text-h2 font-bold text-accent">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t border-border">
            <h2 className="text-h3 font-bold text-text-primary">
              Контакты
            </h2>

            <Input
              label="Имя"
              type="text"
              placeholder="Ваше имя"
              value={name[0]}
              onChange={(e) => name[1](e.target.value)}
              required
            />

            <Input
              label="Телефон"
              type="tel"
              placeholder="+7 (999) 123-45-67"
              {...phone}
              required
            />

            <Textarea
              label="Комментарий"
              placeholder="Комментарий к заказу..."
              rows={3}
              value={comment[0]}
              onChange={(e) => comment[1](e.target.value)}
            />

            <div className="space-y-2">
              <p className="text-caption text-text-secondary">
                * Даже если мессенджер недоступен, заявка остаётся в панели.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </form>
        </div>
      )}

      {/* Success State */}
      {currentStep === 3 && (
        <div className="text-center space-y-6 py-12">
          <div className="w-20 h-20 mx-auto bg-success rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-text-inverse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-h2 font-bold text-text-primary">
            Заявка отправлена!
          </h2>
          <p className="text-body text-text-secondary max-w-md mx-auto">
            Мы получили вашу заявку и скоро свяжемся с вами для подтверждения.
          </p>
          <a
            href="/menu"
            className="inline-block bg-accent text-text-inverse px-8 py-3 rounded-sm font-semibold body hover:bg-accent-hover transition-colors"
          >
            Вернуться в меню
          </a>
        </div>
      )}
    </div>
  );
}

function CartItem({ item }: { item: { menuItemId: number; name: string; price: number; qty: number; unit: string } }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="bg-surface rounded-md p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1 space-y-1">
        <h3 className="font-semibold body text-text-primary">{item.name}</h3>
        <p className="text-small text-text-secondary">{item.qty} {item.unit}</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-bold text-body text-text-primary min-w-[80px] text-right">
          {formatPrice(item.price * item.qty)}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQty(item.menuItemId, item.qty - 1)}
            className="w-8 h-8 rounded-sm border border-border flex items-center justify-center text-body font-bold hover:bg-bg-light transition-colors cursor-pointer"
            aria-label="Уменьшить количество"
          >
            −
          </button>
          <span className="w-8 text-center body font-semibold">{item.qty}</span>
          <button
            onClick={() => updateQty(item.menuItemId, item.qty + 1)}
            className="w-8 h-8 rounded-sm bg-accent text-text-inverse flex items-center justify-center text-body font-bold hover:bg-accent-hover transition-colors cursor-pointer"
            aria-label="Увеличить количество"
          >
            +
          </button>
        </div>

        <button
          onClick={() => removeItem(item.menuItemId)}
          className="text-text-secondary hover:text-error transition-colors cursor-pointer"
          aria-label="Удалить из корзины"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

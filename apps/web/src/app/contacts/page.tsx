'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/stores/toast-store';
import { usePhoneMask } from '@/hooks/use-phone-mask';
import { FeedbackFormSchema } from '@/lib/validation';

export default function ContactsPage() {
  const { add: addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const name = useState('');
  const phone = usePhoneMask('');
  const message = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate
    const result = FeedbackFormSchema.safeParse({
      name: name[0],
      phone: phone.value.replace(/\D/g, ''),
      message: message[0],
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

    try {
      // TODO: Implement actual API call when endpoint is ready
      // await apiRequest('/contacts/feedback/', {
      //   method: 'POST',
      //   body: JSON.stringify(result.data),
      // });

      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addToast({
        message: 'Сообщение отправлено! Мы свяжемся с вами в ближайшее время.',
        type: 'success',
      });

      // Reset form
      name[1]('');
      phone.onChange({
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>);
      message[1]('');
    } catch (error) {
      addToast({
        message: 'Ошибка отправки. Попробуйте позже.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-h1 md:text-[48px] font-bold text-text-primary">
          Контакты
        </h1>
      </div>

      {/* Contact Info + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-small text-text-secondary mb-2">
                АДРЕС
              </h3>
              <p className="body text-text-primary">
                г. Москва, ул. Примерная, д. 1
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-small text-text-secondary mb-2">
                ТЕЛЕФОН
              </h3>
              <p className="body text-text-primary">
                <a
                  href="tel:+79991234567"
                  className="hover:text-accent transition-colors"
                >
                  +7 (999) 123-45-67
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-small text-text-secondary mb-2">
                EMAIL
              </h3>
              <p className="body text-text-primary">
                <a
                  href="mailto:info@osobovkusno.ru"
                  className="hover:text-accent transition-colors"
                >
                  info@osobovkusno.ru
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-small text-text-secondary mb-2">
                ЧАСЫ РАБОТЫ
              </h3>
              <p className="body text-text-primary">
                Пн-Пт: 10:00 — 22:00
              </p>
              <p className="body text-text-primary">
                Сб-Вс: 10:00 — 23:00
              </p>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-bg-light rounded-lg min-h-[300px] md:min-h-[400px] flex items-center justify-center border-2 border-dashed border-border">
          <div className="text-center space-y-2">
            <svg
              className="w-16 h-16 mx-auto text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-small text-text-secondary">
              Карта будет здесь
            </p>
            <p className="text-caption text-text-muted">
              Интеграция с Яндекс.Картами
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="space-y-6">
        <h2 className="text-h2 font-bold text-text-primary">
          Форма обратной связи
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
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
            label="Сообщение"
            placeholder="Ваше сообщение..."
            rows={5}
            value={message[0]}
            onChange={(e) => message[1](e.target.value)}
            required
          />

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить'}
          </Button>
        </form>
      </div>
    </div>
  );
}

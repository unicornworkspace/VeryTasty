'use client';

import { Button } from '@/components/ui/Button';
import { DarkCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/stores/toast-store';
import { useState } from 'react';

export default function AdminDashboard() {
  const { add: addToast } = useToast();
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);

  const stats = [
    { label: 'Новые заявки', value: '12', color: 'text-accent' },
    { label: 'Активные акции', value: '5', color: 'text-success' },
    { label: 'Гостей за неделю', value: '234', color: 'text-text-primary' },
    { label: 'Выручка', value: '₽145K', color: 'text-text-primary' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-md p-4 md:p-6 shadow-sm"
          >
            <p className="text-small text-text-secondary mb-1">
              {stat.label}
            </p>
            <p className={`text-h1 md:text-[40px] font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-h2 font-bold text-text-primary">
          Быстрые действия
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminActionCard
            title="Управление меню"
            description="Редактировать блюда, цены, категории"
            icon="📖"
            href="/admin/menu"
          />
          <AdminActionCard
            title="Заявки"
            description="Просмотр и управление заявками"
            icon="📋"
            href="/admin/orders"
          />
          <AdminActionCard
            title="Акции"
            description="Создавать и управлять акциями"
            icon="🎁"
            href="/admin/promo"
            onClick={() => setIsCreatingPromo(true)}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-h2 font-bold text-text-primary">
          Последняя активность
        </h2>

        <div className="bg-surface rounded-md shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="font-semibold body text-text-primary">
              Новые заявки
            </p>
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 flex items-center justify-between hover:bg-bg-light transition-colors"
              >
                <div>
                  <p className="font-medium body text-text-primary">
                    Заявка #{1000 + i}
                  </p>
                  <p className="text-small text-text-secondary">
                    {new Date().toLocaleDateString('ru-RU')} в{' '}
                    {`${10 + i}:${String(i * 10).padStart(2, '0')}`}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-small font-semibold bg-accent bg-opacity-10 text-accent">
                  Новая
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Promotion Modal */}
      {isCreatingPromo && (
        <CreatePromotionModal
          onClose={() => setIsCreatingPromo(false)}
          onSuccess={() => {
            addToast({
              message: 'Акция создана и опубликована!',
              type: 'success',
            });
            setIsCreatingPromo(false);
          }}
        />
      )}
    </div>
  );
}

function AdminActionCard({
  title,
  description,
  icon,
  href,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className="bg-surface rounded-md p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer block"
    >
      <span className="text-3xl mb-3 block">{icon}</span>
      <h3 className="font-semibold body text-text-primary mb-1">{title}</h3>
      <p className="text-small text-text-secondary">{description}</p>
    </a>
  );
}

function CreatePromotionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { add: addToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast({
        message: 'Введите название акции',
        type: 'error',
      });
      return;
    }

    // TODO: Implement actual API call
    onSuccess();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Создать акцию"
    >
      <div
        className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-bold text-text-primary">
              Новое предложение
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary cursor-pointer"
              aria-label="Закрыть"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-body text-text-secondary">
            Покажите гостям то, что актуально сейчас.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <Input
                  label="Название"
                  type="text"
                  placeholder="Введите название акции"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-small font-medium text-text-primary mb-2">
                    Период действия
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-body"
                    />
                    <input
                      type="date"
                      className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-body"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-small font-medium text-text-primary mb-2">
                    Кому показать
                  </label>
                  <select className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-body">
                    <option>Всем гостям</option>
                    <option>Новым гостям</option>
                    <option>Выбранная аудитория</option>
                  </select>
                </div>

                <div>
                  <label className="block text-small font-medium text-text-primary mb-2">
                    Где показать
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-small">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Сайт
                    </label>
                    <label className="flex items-center gap-2 text-small">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Приложение
                    </label>
                    <label className="flex items-center gap-2 text-small">
                      <input type="checkbox" className="rounded" />
                      Уведомление
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="text-small font-semibold text-text-secondary mb-3">
                  ПРЕДПРОСМОТР
                </h3>
                <DarkCard className="min-h-[200px]">
                  <div className="space-y-3">
                    <div className="w-full aspect-video bg-bg-light bg-opacity-20 rounded-sm flex items-center justify-center">
                      <span className="text-text-muted text-small">
                        {title ? title : '{ФОТО}'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold body">
                        {title || 'Название'}
                      </p>
                      <p className="text-small text-text-muted mt-1">
                        {description || 'Описание акции'}
                      </p>
                    </div>
                    <p className="text-small text-accent">
                      Посмотреть условия →
                    </p>
                  </div>
                </DarkCard>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-4"
                >
                  Опубликовать
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useOrders } from '@/hooks/use-api';
import { DarkCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoginModal } from '@/components/ui/LoginModal';
import { formatPrice } from '@/lib/utils';
import type { Request as OrderType } from '@/lib/types';

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading: ordersLoading, error } = useOrders(50);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="skeleton h-12 w-48 rounded-sm" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-h1 md:text-[48px] font-bold text-text-primary">
            История заказов
          </h1>
          <p className="text-body text-text-secondary">
            Для просмотра заказов необходимо войти в аккаунт
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={() => setShowLoginModal(true)}
          >
            Войти
          </Button>
          <a href="/menu">
            <Button variant="secondary" size="lg">
              Смотреть меню
            </Button>
          </a>
        </div>

        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: 'Новая',
      CONFIRMED: 'Подтверждена',
      PREPARING: 'Готовится',
      READY: 'Готова',
      COMPLETED: 'Завершена',
      CANCELLED: 'Отменена',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-info text-info-content',
      CONFIRMED: 'bg-warning text-warning-content',
      PREPARING: 'bg-accent text-text-inverse',
      READY: 'bg-success text-success-content',
      COMPLETED: 'bg-bg-dark text-text-inverse',
      CANCELLED: 'bg-error text-error-content',
    };
    return colors[status] || 'bg-bg-dark text-text-inverse';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-h1 md:text-[48px] font-bold text-text-primary">
          История заказов
        </h1>
        <p className="text-body text-text-secondary">
          Все ваши заявки
        </p>
      </div>

      {/* Orders List */}
      {ordersLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-lg p-6 animate-pulse"
            >
              <div className="h-6 bg-border rounded w-1/3 mb-4" />
              <div className="h-4 bg-border rounded w-2/3 mb-2" />
              <div className="h-4 bg-border rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 space-y-4">
          <svg
            className="w-16 h-16 mx-auto text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-body text-text-secondary">
            Не удалось загрузить заказы
          </p>
          <p className="text-small text-text-muted">
            Проверьте подключение к интернету или обновите страницу
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={() => window.location.reload()}>
              Обновить
            </Button>
          </div>
        </div>
      ) : !orders || (Array.isArray(orders) && orders.length === 0) ? (
        <div className="text-center py-16 space-y-4">
          <svg
            className="w-16 h-16 mx-auto text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-body text-text-secondary">
            У вас пока нет заказов
          </p>
          <a href="/menu">
            <Button size="lg">
              Перейти в меню
            </Button>
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => setSelectedOrder(order)}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
}

function OrderCard({
  order,
  onClick,
  getStatusLabel,
  getStatusColor,
}: {
  order: OrderType;
  onClick: () => void;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-surface rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-border"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-h3 sm:text-h2 text-text-primary">
              Заказ #{order.id}
            </h3>
            <span className={`px-3 py-1 rounded-full text-caption font-semibold ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-small text-text-secondary">
            {new Date(order.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="text-right">
          <p className="text-small text-text-muted">Итого</p>
          <p className="font-bold text-h2 sm:text-h1 text-accent">
            {formatPrice(parseFloat(order.total_preview))}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-small text-text-secondary">
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span>
          {order.items?.length || 0} {order.items?.length === 1 ? 'позиция' : 'позиций'}
        </span>
      </div>
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  getStatusLabel,
  getStatusColor,
}: {
  order: OrderType;
  onClose: () => void;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-bold text-h2 text-text-primary">
                Заказ #{order.id}
              </h2>
              <p className="text-small text-text-secondary">
                {new Date(order.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer rounded-lg hover:bg-bg-light transition-colors"
              aria-label="Закрыть"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-small font-semibold ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h3 className="font-bold text-h3 text-text-primary">Состав заказа</h3>
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex-1">
                  <p className="font-semibold body text-text-primary">
                    {item.name_snapshot}
                  </p>
                  <p className="text-small text-text-secondary">
                    {item.qty} {item.qty === 1 ? 'шт' : 'шт'}
                  </p>
                </div>
                <p className="font-bold text-body text-text-primary">
                  {formatPrice(parseFloat(item.price_snapshot) * item.qty)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="text-h3 font-bold text-text-primary">
                Итого:
              </span>
              <span className="text-h2 font-bold text-accent">
                {formatPrice(parseFloat(order.total_preview))}
              </span>
            </div>
          </div>

          {/* Comment */}
          {order.comment && (
            <div className="space-y-2">
              <h3 className="font-bold text-h3 text-text-primary">Комментарий</h3>
              <p className="text-body text-text-secondary bg-bg-light p-4 rounded-lg">
                {order.comment}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <a href="/menu" className="flex-1">
              <Button className="w-full">
                Новый заказ
              </Button>
            </a>
            <button
              onClick={onClose}
              className="bg-surface border border-border text-text-primary px-6 py-3 rounded-lg font-semibold body hover:bg-bg-light transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

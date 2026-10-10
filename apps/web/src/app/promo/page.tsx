'use client';

import { DarkCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DishCardSkeleton } from '@/components/ui/Skeleton';
import { usePromotions } from '@/hooks/use-api';
import { useState } from 'react';
import type { Promotion } from '@/lib/types';

export default function PromoPage() {
  const { data: promotions, isLoading } = usePromotions();
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  const activePromotions = promotions?.filter(
    (p) => p.status === 'active' && new Date(p.end_at) > new Date()
  ) || [];

  const featuredPromotion = activePromotions[0];
  const codePromotion = activePromotions.find((p) => p.promotion_type === 'code');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-h1 md:text-[48px] font-bold text-text-primary">
          Для вас
        </h1>
        <p className="text-body text-text-secondary">
          Акции и предложения
        </p>
      </div>

      {/* Featured Banner */}
      {featuredPromotion && (
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden shadow-md">
          {featuredPromotion.image_url ? (
            <img
              src={featuredPromotion.image_url}
              alt={featuredPromotion.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-bg-light flex items-center justify-center">
              {featuredPromotion.title}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8 space-y-3 max-w-2xl">
            <h2 className="text-h2 md:text-h1 font-bold text-text-inverse">
              {featuredPromotion.title}
            </h2>
            <p className="text-body text-text-muted">
              {featuredPromotion.description}
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setSelectedPromotion(featuredPromotion)}
            >
              Посмотреть условия →
            </Button>
          </div>
        </div>
      )}

      {/* Promo Code Card */}
      {codePromotion && (
        <DarkCard>
          <div className="space-y-4">
            <h3 className="text-h2 md:text-h1 font-bold">Промокод гостя</h3>
            <div className="bg-bg-light bg-opacity-10 rounded-sm p-4 md:p-6">
              <p className="text-h2 md:text-h1 font-mono font-bold tracking-widest text-center">
                {codePromotion.title}
              </p>
            </div>
            <Button
              variant="ghost"
              size="md"
              className="text-text-muted hover:text-text-inverse"
              onClick={() => setSelectedPromotion(codePromotion)}
            >
              Показать условия →
            </Button>
          </div>
        </DarkCard>
      )}

      {/* Info Banner */}
      <div className="bg-bg-card-dark bg-opacity-30 rounded-lg p-6 flex items-center gap-3">
        <span className="text-2xl">🎁</span>
        <div>
          <p className="font-semibold body text-text-primary">
            Все предложения — здесь
          </p>
          <p className="text-small text-text-secondary">
            Выбирайте и используйте при следующем визите.
          </p>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <DishCardSkeleton key={i} />
          ))
        ) : activePromotions.length > 0 ? (
          activePromotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-surface rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              onClick={() => setSelectedPromotion(promo)}
            >
              <div className="relative w-full aspect-[4/3] bg-bg-light">
                {promo.image_url ? (
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary caption">
                    {promo.title}
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-text-primary body">
                  {promo.title}
                </h3>
                <p className="text-small text-text-secondary line-clamp-2">
                  {promo.description}
                </p>
                <p className="text-small font-semibold text-accent">
                  Показать условия →
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="text-body text-text-secondary">
              Сейчас нет активных акций
            </p>
          </div>
        )}
      </div>

      {/* Promotion Modal */}
      {selectedPromotion && (
        <PromotionModal
          promotion={selectedPromotion}
          onClose={() => setSelectedPromotion(null)}
        />
      )}
    </div>
  );
}

function PromotionModal({
  promotion,
  onClose,
}: {
  promotion: Promotion;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Условия акции: ${promotion.title}`}
    >
      <div
        className="bg-surface rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg transform transition-all duration-250 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-[16/9] bg-bg-light">
          {promotion.image_url ? (
            <img
              src={promotion.image_url}
              alt={promotion.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary">
              {promotion.title}
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-h2 font-bold text-text-primary">
              {promotion.title}
            </h2>
            <p className="text-body text-text-secondary mt-2">
              {promotion.description}
            </p>
          </div>

          <div className="space-y-2 text-small">
            <p>
              <span className="font-semibold">Тип:</span>{' '}
              {promotion.promotion_type === 'percent'
                ? 'Процентная скидка'
                : promotion.promotion_type === 'fixed'
                ? 'Фиксированная скидка'
                : 'Промокод'}
            </p>
            <p>
              <span className="font-semibold">Скидка:</span>{' '}
              {promotion.discount_value}
            </p>
            <p>
              <span className="font-semibold">Период:</span>{' '}
              {new Date(promotion.start_at).toLocaleDateString('ru-RU')} —{' '}
              {new Date(promotion.end_at).toLocaleDateString('ru-RU')}
            </p>
          </div>

          <Button variant="primary" size="md" className="w-full" onClick={onClose}>
            Понятно
          </Button>
        </div>
      </div>
    </div>
  );
}

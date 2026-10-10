import Link from 'next/link';
import { DishCard, DarkCard } from '@/components/ui/Card';
import { DishCardSkeleton } from '@/components/ui/Skeleton';
import { getMenuItems, getCategories, getPromotions } from '@/lib/api-client';
import type { MenuItem, Promotion } from '@/lib/types';

/**
 * Получает избранные блюда для отображения на главной
 */
async function getFeaturedItems(): Promise<MenuItem[]> {
  try {
    const items = await getMenuItems();
    return items.filter((item) => item.is_active && !item.stop_list).slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return [];
  }
}

/**
 * Получает активные акции для отображения на главной
 */
async function getActivePromotions(): Promise<Promotion[]> {
  try {
    const promotions = await getPromotions();
    return promotions.filter(
      (p) => p.status === 'active' && new Date(p.end_at) > new Date()
    );
  } catch (error) {
    console.error('Failed to fetch promotions:', error);
    return [];
  }
}

/**
 * Главная страница ресторана
 * Отображает hero-блок, избранные блюда, превью карты гостя и акции
 */
export default async function HomePage() {
  const [featuredItems, activePromotions] = await Promise.all([
    getFeaturedItems(),
    getActivePromotions(),
  ]);

  const featuredPromotion = activePromotions[0];
  const promoCodePromotion = activePromotions.find((p) => p.promotion_type === 'code');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 space-y-12 sm:space-y-16 md:space-y-20">
      {/* Hero Section — главный баннер */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        <div className="space-y-6 sm:space-y-8">
          <h1 className="text-h1 md:text-[56px] lg:text-[64px] font-bold text-text-primary leading-tight">
            С огня — <br />
            к вашему столу
          </h1>
          <p className="text-body md:text-h3 text-text-secondary leading-relaxed">
            Выбирайте любимые блюда и открывайте предложения для гостей
            ресторана.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/menu"
              className="bg-accent text-text-inverse px-6 py-3 rounded-lg font-semibold body hover:bg-accent-hover active:bg-accent-pressed transition-colors duration-150 inline-block shadow-lg hover:shadow-xl"
            >
              Смотреть меню
            </Link>
            <Link
              href="/club"
              className="bg-bg-dark text-text-inverse px-6 py-3 rounded-lg font-semibold body hover:bg-opacity-90 transition-colors duration-150 inline-block shadow-lg hover:shadow-xl"
            >
              Карта гостя
            </Link>
          </div>
        </div>

        {/* Hero изображение */}
        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-[16/10] bg-bg-light rounded-2xl overflow-hidden shadow-2xl">
          {featuredItems.length > 0 && featuredItems[0].image_url ? (
            <img
              src={featuredItems[0].image_url}
              alt={featuredItems[0].name}
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary gap-4">
              <svg
                className="w-24 h-24 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-body">Фото блюда</span>
            </div>
          )}
        </div>
      </section>

      {/* Featured Dishes — избранные блюда */}
      <section className="space-y-8 sm:space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 font-bold text-text-primary">
            Что попробуем сегодня?
          </h2>
          <Link
            href="/menu"
            className="text-accent font-semibold body hover:underline flex items-center gap-2"
          >
            Всё меню
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredItems.length > 0 ? (
            featuredItems.map((item) => (
              <Link key={item.id} href={`/menu`} passHref>
                <DishCard item={item} />
              </Link>
            ))
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <DishCardSkeleton key={i} />
            ))
          )}
        </div>
      </section>

      {/* Guest Card Preview — превью карты гостя */}
      <section>
        <Link href="/club" className="block">
          <DarkCard className="cursor-pointer hover:shadow-2xl transition-all duration-300 group">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="space-y-3 text-center md:text-left">
                <h3 className="text-h2 md:text-h1 font-bold tracking-wide">ОСОБО ВКУСНО</h3>
                <p className="text-h3 md:text-h2 font-semibold text-accent">Ваша карта гостя</p>
                <p className="text-body text-text-muted max-w-md">
                  Накапливайте бонусы и получайте эксклюзивные предложения
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white bg-opacity-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h2m-2 0h-2M2 12h2m6-8v1m-6 0h2M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </DarkCard>
        </Link>
      </section>

      {/* Promotions — акции и предложения */}
      <section className="space-y-8 sm:space-y-10">
        <h2 className="text-h2 font-bold text-text-primary">
          Для вас — акции и предложения
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {featuredPromotion && (
            <Link href="/promo" passHref>
              <div className="relative w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                {featuredPromotion.image_url ? (
                  <img
                    src={featuredPromotion.image_url}
                    alt={featuredPromotion.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-bg-light to-bg-dark flex items-center justify-center">
                    <span className="text-body text-text-secondary">{featuredPromotion.title}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/50 to-transparent opacity-90" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 space-y-3">
                  <h3 className="text-h3 font-bold text-text-inverse">
                    {featuredPromotion.title}
                  </h3>
                  <p className="text-small text-text-muted">
                    Посмотреть условия →
                  </p>
                </div>
              </div>
            </Link>
          )}

          {promoCodePromotion ? (
            <Link href="/promo" passHref>
              <DarkCard className="cursor-pointer hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎁</span>
                    <h3 className="text-h3 font-bold">Промокод гостя</h3>
                  </div>
                  <p className="text-body text-text-muted">
                    {promoCodePromotion.description || 'Специальное предложение'}
                  </p>
                </div>
                <p className="text-small text-accent font-semibold mt-4 group-hover:underline">
                  Показать условия →
                </p>
              </DarkCard>
            </Link>
          ) : (
            <DarkCard className="h-full flex items-center justify-center min-h-[200px]">
              <div className="text-center space-y-3">
                <span className="text-4xl">🎁</span>
                <p className="text-body text-text-muted">
                  Все предложения — здесь
                </p>
              </div>
            </DarkCard>
          )}
        </div>
      </section>
    </div>
  );
}

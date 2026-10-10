'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLoyaltyBalance, useLoyaltyQrToken } from '@/hooks/use-api';
import { DarkCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoginModal } from '@/components/ui/LoginModal';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function ClubPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: loyalty, isLoading: loyaltyLoading } = useLoyaltyBalance();
  const { data: qrData, isLoading: qrLoading } = useLoyaltyQrToken();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fallback mock data when API is not available
  const mockBalance = '500';
  const displayBalance = loyaltyLoading ? '0' : (loyalty?.balance_cached || mockBalance);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <div className="skeleton h-12 w-48 rounded-sm" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-h1 md:text-[48px] font-bold text-text-primary">
            Карта гостя
          </h1>
          <p className="text-body text-text-secondary">
            Для просмотра баланса и QR-кода необходимо войти в аккаунт
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={() => setShowLoginModal(true)}
          >
            Войти
          </Button>
          <Link href="/menu">
            <Button variant="secondary" size="lg">
              Смотреть меню
            </Button>
          </Link>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-h1 md:text-[48px] font-bold text-text-primary">
          Карта гостя
        </h1>
      </div>

      {/* Guest Card */}
      <DarkCard className="p-6 sm:p-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 md:text-h1 font-bold">ОСОБО ВКУСНО</h2>
            <span className="text-small text-text-muted">
              {user.name || 'Гость'}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-h1 md:text-[56px] font-bold text-accent">
              {displayBalance}
            </p>
            <p className="text-body text-text-muted">бонусов</p>
          </div>
        </div>
      </DarkCard>

      {/* QR Code */}
      <div className="bg-surface rounded-lg p-6 sm:p-8 md:p-12 shadow-sm flex flex-col items-center justify-center space-y-4">
        {qrLoading ? (
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-bg-light rounded-md flex items-center justify-center border-2 border-dashed border-border animate-pulse">
            <div className="text-center space-y-2">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-text-muted"
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
              <p className="text-small text-text-secondary">Загрузка...</p>
            </div>
          </div>
        ) : qrData ? (
          <>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <QRCodeSVG
                value={qrData.token}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-center space-y-2">
              <p className="text-small text-text-secondary">
                Покажите сотруднику для начисления бонусов
              </p>
              <div className="flex items-center justify-center gap-2 text-small text-text-muted">
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
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span>{qrData.phone || user?.phone}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <svg
              className="w-12 h-12 mx-auto text-error"
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
              Не удалось загрузить QR-код
            </p>
            <p className="text-small text-text-muted">
              Возможно, сессия истекла. Попробуйте выйти и войти снова.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button size="sm" onClick={() => window.location.reload()}>
                Обновить
              </Button>
              <button
                onClick={() => { logout(); window.location.href = '/'; }}
                className="text-accent font-semibold body text-small cursor-pointer hover:underline"
              >
                Выйти и войти снова
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <button className="bg-surface rounded-md p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left cursor-pointer">
          <h3 className="font-semibold body text-text-primary mb-1">
            История бонусов →
          </h3>
          <p className="text-small text-text-secondary">
            Просмотреть все операции
          </p>
        </button>

        <button className="bg-surface rounded-md p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left cursor-pointer">
          <h3 className="font-semibold body text-text-primary mb-1">
            Правила программы →
          </h3>
          <p className="text-small text-text-secondary">
            Как накапливать и списывать бонусы
          </p>
        </button>
      </div>

      {/* How It Works */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-h2 font-bold text-text-primary">
          Как это работает
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <StepCard
            step="1"
            title="Гость показывает QR"
            description="Откройте карту гостя и покажите QR-код сотруднику"
          />
          <StepCard
            step="2"
            title="Сотрудник подтверждает"
            description="Сотрудник сканирует QR и подтверждает покупку"
          />
          <StepCard
            step="3"
            title="Гость видит результат"
            description="Бонусы автоматически начисляются на ваш счёт"
          />
        </div>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <div className="w-12 h-12 rounded-full bg-accent text-text-inverse flex items-center justify-center text-h3 font-bold">
        {step}
      </div>
      <h3 className="font-semibold body text-text-primary">{title}</h3>
      <p className="text-small text-text-secondary">{description}</p>
    </div>
  );
}

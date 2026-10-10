'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/stores/toast-store';
import { Button } from '@/components/ui/Button';
import { OtpVerifySchema } from '@/lib/validation';

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { login, requestOtp } = useAuth();
  const { add: addToast } = useToast();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handleSendOtp = async () => {
    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');

    // Validate: must start with 7 or 8, and be 11 digits
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setPhoneError('Введите корректный номер телефона');
      return;
    }

    setPhoneError('');
    setIsLoading(true);
    try {
      await requestOtp(cleanPhone);
      setStep('otp');
      addToast({
        message: 'Код отправлен по SMS',
        type: 'success',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка отправки';
      addToast({
        message,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    // Clean phone number for validation
    const cleanPhone = phone.replace(/\D/g, '');
    const result = OtpVerifySchema.safeParse({ phone: cleanPhone, otp_code: otpCode });
    if (!result.success) {
      addToast({
        message: result.error.errors[0]?.message || 'Введите код',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanPhone, otpCode);
      addToast({
        message: 'Вы успешно вошли в аккаунт',
        type: 'success',
      });
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка входа';
      addToast({
        message,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Вход в аккаунт"
    >
      <div
        className="bg-surface rounded-lg max-w-md w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-bold text-text-primary">
              {step === 'phone' ? 'Вход' : 'Подтверждение'}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary cursor-pointer"
              aria-label="Закрыть"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {step === 'phone' ? (
            <div className="space-y-4">
              <p className="text-body text-text-secondary">
                Введите номер телефона для получения кода подтверждения
              </p>

              <input
                type="tel"
                placeholder="+79991234567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError('');
                }}
                className={`w-full bg-bg-light border border-border rounded-sm px-4 py-3 text-body text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-opacity-20 ${
                  phoneError
                    ? 'focus:border-error focus:ring-error'
                    : 'focus:border-accent'
                }`}
                aria-label="Номер телефона"
              />
              {phoneError && (
                <p className="text-small text-error">{phoneError}</p>
              )}

              <Button
                size="lg"
                className="w-full"
                disabled={isLoading}
                onClick={handleSendOtp}
              >
                {isLoading ? 'Отправка...' : 'Получить код'}
              </Button>

              <p className="text-caption text-text-secondary text-center">
                Код будет отправлен по SMS
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-body text-text-secondary">
                Введите код из SMS, отправленный на {phone}
              </p>

              <input
                type="text"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-bg-light border border-border rounded-sm px-4 py-3 text-body text-text-primary placeholder-text-secondary text-center text-h2 tracking-widest focus:outline-none focus:border-accent focus:ring-2 focus:ring-opacity-20 focus:ring-accent"
                maxLength={6}
                aria-label="Код подтверждения"
              />

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep('phone')}
                  disabled={isLoading}
                >
                  Назад
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={isLoading || otpCode.length !== 6}
                  onClick={handleVerifyOtp}
                >
                  {isLoading ? 'Проверка...' : 'Войти'}
                </Button>
              </div>

              <p className="text-caption text-text-secondary text-center">
                <button
                  onClick={handleSendOtp}
                  className="text-accent hover:underline cursor-pointer"
                  disabled={isLoading}
                >
                  Отправить код повторно
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

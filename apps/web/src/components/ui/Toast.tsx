'use client';

import { useEffect } from 'react';
import { useToast, type ToastType } from '@/stores/toast-store';
import { cn } from '@/lib/utils';

const typeStyles: Record<ToastType, string> = {
  success: 'bg-success text-text-inverse',
  error: 'bg-error text-text-inverse',
  info: 'bg-bg-dark text-text-inverse',
};

const typeIcons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => remove(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-md shadow-lg min-w-[280px] max-w-[400px]',
        'animate-in slide-in-from-right duration-200',
        typeStyles[type]
      )}
      role="alert"
    >
      <span className="flex-shrink-0">{typeIcons[type]}</span>
      <p className="flex-1 text-small font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Закрыть"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

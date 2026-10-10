import { create } from 'zustand';
import { generateId } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],

  add: (toast) => {
    const id = generateId();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  remove: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

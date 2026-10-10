import { create } from 'zustand';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (menuItemId: number) => void;
  updateQty: (menuItemId: number, qty: number) => void;
  clear: () => void;
  get total(): number;
  get itemCount(): number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menuItemId === item.menuItemId
              ? { ...i, qty: i.qty + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...item, qty: 1 }] };
    });
  },

  removeItem: (menuItemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.menuItemId !== menuItemId),
    }));
  },

  updateQty: (menuItemId, qty) => {
    if (qty <= 0) {
      get().removeItem(menuItemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, qty } : i
      ),
    }));
  },

  clear: () => {
    set({ items: [] });
  },

  get total() {
    return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  get itemCount() {
    return get().items.reduce((sum, item) => sum + item.qty, 0);
  },
}));

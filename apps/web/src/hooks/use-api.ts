import useSWR from 'swr';
import {
  getMenuItems,
  getCategories,
  getPromotions,
  getLoyaltyBalance,
  getLoyaltyHistory,
  getQrToken,
  createOrder,
  getOrders,
  getOrderById,
} from '@/lib/api-client';
import type { Request as OrderType } from '@/lib/types';

export function useMenuItems(categorySlug?: string) {
  return useSWR(categorySlug ? [`/menu/items`, categorySlug] : '/menu/items', {
    fetcher: (key: [string, string] | string) => (Array.isArray(key) ? getMenuItems(key[1]) : getMenuItems()),
    revalidateOnFocus: false,
  });
}

export function useCategories() {
  return useSWR('/menu/categories', getCategories, {
    revalidateOnFocus: false,
  });
}

export function usePromotions() {
  return useSWR('/promotions', getPromotions, {
    revalidateOnFocus: false,
  });
}

export function useLoyaltyBalance() {
  return useSWR('/loyalty/me', getLoyaltyBalance, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });
}

export function useLoyaltyHistory() {
  return useSWR('/loyalty/history', getLoyaltyHistory, {
    revalidateOnFocus: false,
  });
}

export function useLoyaltyQrToken() {
  return useSWR('/loyalty/qr-token', () => getQrToken(), {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    dedupingInterval: 60, // 60 seconds cache
  });
}

export function useOrders(limit = 50, status?: string) {
  return useSWR<OrderType[]>(
    ['/orders', limit, status],
    () => getOrders(limit, status),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );
}

export function useOrderById(id: number | null) {
  return useSWR(
    id ? ['/orders', id] : null,
    () => id ? getOrderById(id) : null,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 30,
    }
  );
}

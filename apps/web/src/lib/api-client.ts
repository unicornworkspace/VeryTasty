import type { Request as OrderType, MenuItem, Category, Promotion, OTPResponse, AuthResponse, TokenRefreshResponse, User, LoyaltyAccount, LoyaltyTransaction } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('refresh_token');
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add headers from options
  if (options.headers) {
    if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
      for (const [key, value] of Object.entries(options.headers)) {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      }
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }

  const data = await response.json();
  
  // If response is paginated (has 'results' field), return the results array
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results as T;
  }
  
  return data as T;
}

// Menu API
export async function getMenuItems(categorySlug?: string): Promise<MenuItem[]> {
  const params = new URLSearchParams();
  if (categorySlug) params.set('category', categorySlug);
  const query = params.toString();
  return apiRequest<MenuItem[]>(`/menu/items/${query ? '?' + query : ''}`);
}

export async function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/menu/categories/');
}

export async function getMenuItemById(id: number): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu/items/${id}/`);
}

// Promotions API
export async function getPromotions(): Promise<Promotion[]> {
  return apiRequest<Promotion[]>('/promotions/');
}

// Auth API
export async function requestOtp(phone: string, deviceInfo = ''): Promise<OTPResponse> {
  return apiRequest<OTPResponse>('/auth/request-otp/', {
    method: 'POST',
    body: JSON.stringify({ phone, device_info: deviceInfo }),
  });
}

export async function verifyOtp(phone: string, otpCode: string, deviceInfo = ''): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/verify-otp/', {
    method: 'POST',
    body: JSON.stringify({ phone, otp_code: otpCode, device_info: deviceInfo }),
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenRefreshResponse> {
  return apiRequest<TokenRefreshResponse>('/auth/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function logout(refreshToken: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>('/auth/logout/', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

// User API
export async function getUserProfile(): Promise<User> {
  return apiRequest<User>('/auth/me/');
}

export async function updateUserProfile(data: { name?: string; marketing_consent?: boolean }): Promise<User> {
  return apiRequest<User>('/auth/me/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Orders API
export async function createRequest(data: {
  items: Array<{ menu_item: number | null; name_snapshot: string; price_snapshot: string; qty: number }>;
  comment?: string;
  channel?: string;
}): Promise<Request> {
  return apiRequest<Request>('/orders/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Loyalty API
export async function getLoyaltyBalance(): Promise<LoyaltyAccount> {
  return apiRequest<LoyaltyAccount>('/loyalty/me/');
}

export async function getLoyaltyHistory(): Promise<LoyaltyTransaction[]> {
  return apiRequest<LoyaltyTransaction[]>('/loyalty/history/');
}

// QR Token
export async function getQrToken(): Promise<{ token: string; phone: string }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/loyalty/qr-token/`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to get QR token');
  }

  return await response.json();
}

export async function verifyQrToken(token: string): Promise<{
  valid: boolean;
  user_id?: number;
  phone?: string;
  name?: string;
  balance?: string;
}> {
  const response = await fetch(`${API_BASE}/loyalty/qr-verify/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  return await response.json();
}

// Orders API
export async function createOrder(data: {
  items: Array<{ menu_item: number | null; name_snapshot: string; price_snapshot: string; qty: number }>;
  comment?: string;
}): Promise<OrderType> {
  return apiRequest<OrderType>('/orders/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOrders(limit = 50, status?: string): Promise<OrderType[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (status) params.set('status', status);
  const query = params.toString();
  return apiRequest<OrderType[]>(`/orders/?${query}`);
}

export async function getOrderById(id: number): Promise<OrderType> {
  return apiRequest<OrderType>(`/orders/${id}/`);
}

// Export API_BASE for direct use if needed
export { API_BASE };

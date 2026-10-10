// TypeScript types matching Django API models

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  unit: string;
  quantity: number;
  price: string;
  is_active: boolean;
  stop_list: boolean;
  categories: Category[];
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  image_url: string;
  promotion_type: 'percent' | 'fixed' | 'code';
  discount_value: string;
  start_at: string;
  end_at: string;
  status: 'draft' | 'active' | 'ended';
  audience_type: 'guest' | 'new' | 'all';
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  id: number;
  code: string;
  promotion: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
}

export interface User {
  id: number;
  phone: string;
  name: string;
  status: string;
  marketing_consent: boolean;
  created_at: string;
}

export interface LoyaltyAccount {
  user: number;
  balance_cached: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: number;
  user: number;
  type: 'earn' | 'spend' | 'bonus' | 'refund';
  amount: string;
  reference_type: string;
  reference_id: string;
  idempotency_key: string;
  created_by: number | null;
  comment: string;
  created_at: string;
}

export interface RequestItem {
  id: number;
  menu_item: number | null;
  name_snapshot: string;
  price_snapshot: string;
  qty: number;
}

export interface Request {
  id: number;
  user: number;
  status: 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total_preview: string;
  comment: string;
  channel: string;
  created_at: string;
  updated_at: string;
  items: RequestItem[];
}

export interface Device {
  id: number;
  user: number;
  platform: string;
  push_token: string;
  enabled: boolean;
  updated_at: string;
}

export interface OutboxEvent {
  id: number;
  type: string;
  aggregate_id: string;
  payload_json: Record<string, unknown>;
  status: string;
  attempts: number;
  next_attempt_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  actor_type: string;
  actor_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  payload_json: Record<string, unknown>;
  created_at: string;
}

// API Response types
export interface OTPResponse {
  status: string;
  message: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_created: boolean;
  user: User;
}

export interface TokenRefreshResponse {
  access_token: string;
}

// Cart item for frontend state
export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  qty: number;
  unit: string;
}

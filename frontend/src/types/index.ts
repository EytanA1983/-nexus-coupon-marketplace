// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    error_code: string;
    code: string;
    requestId?: string;
    details?: any;
  };
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Admin Coupon
export interface AdminCoupon {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  currency: string;
  costPrice: string;
  marginPercentage: string;
  minimumSellPrice: string;
  stock: number;
  reservedStock: number;
  isActive: boolean;
  category: string | null;
  tags: string[];
  coupon: {
    id: string;
    value: string;
    code: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponRequest {
  sku?: string | null;
  name: string;
  description?: string | null;
  currency?: string;
  costPrice: number;
  marginPercentage: number;
  couponValue: number;
  couponCode?: string | null;
  stock?: number;
  isActive?: boolean;
  category?: string | null;
  tags?: string[];
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {}

export interface CouponStats {
  purchaseCount: number;
  totalRevenue: string;
}

// Public Product (Customer/Reseller view)
// Must return ONLY: id, name, description, image_url, price
export interface PublicProduct {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number; // Maps to minimum_sell_price from backend
}

// Purchase
export interface PurchaseRequest {
  productId: string;
}

export interface ResellerPurchaseRequest {
  productId: string;
  resellerPrice: number;
}

export interface PurchaseResult {
  product_id: string;
  final_price: number;
  value_type: 'STRING' | 'IMAGE';
  value: string;
}

export type AdminLoginRequest = {
  username: string;
  password: string;
};

export type AdminLoginResponse = {
  token: string;
};

export type CreateCouponRequest = {
  name: string;
  description: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  value_type: "STRING" | "IMAGE";
  value: string;
};

export type UpdateCouponRequest = Partial<CreateCouponRequest>;

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  type: "COUPON";
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  minimum_sell_price: number;
  is_sold: boolean;
  sold_at: string | null;
  value_type: "STRING" | "IMAGE";
  value: string;
  created_at: string;
  updated_at: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function getAdminToken(): string | null {
  return localStorage.getItem("adminToken");
}

function buildAuthHeaders(): HeadersInit {
  const token = getAdminToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
      throw new Error("Unauthorized");
    }
    
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || fallbackMessage);
  }

  const data = await response.json();
  return data;
}

export async function adminLogin(
  payload: AdminLoginRequest
): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<{ success: boolean; data: { token: string } }>(response, "Admin login failed");
  return { token: data.data.token };
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  return parseResponse<AdminProduct[]>(response, "Failed to load admin products");
}

export async function getAdminProductById(productId: string): Promise<AdminProduct> {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  return parseResponse<AdminProduct>(response, "Failed to load admin product");
}

export async function createAdminCoupon(
  payload: CreateCouponRequest
): Promise<AdminProduct> {
  const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse<AdminProduct>(response, "Failed to create coupon");
}

export async function updateAdminCoupon(
  productId: string,
  payload: UpdateCouponRequest
): Promise<AdminProduct> {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
    method: "PUT",
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse<AdminProduct>(response, "Failed to update coupon");
}

export async function deleteAdminCoupon(productId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  await parseResponse(response, "Failed to delete coupon");
}

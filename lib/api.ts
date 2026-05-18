export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    let data: unknown;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (response.ok) {
      return { success: true, data: data as T };
    }

    const errorMessage =
      typeof data === 'object' && data !== null
        ? ((data as any).error || (data as any).message || response.statusText)
        : String(data || response.statusText);

    return { success: false, error: errorMessage };
  } catch (error) {
    console.error('API request error:', error);
    return { success: false, error: 'An error occurred' };
  }
}

export const fetcher = async <T = any>(url: string): Promise<T> => {
  const result = await apiRequest(url);
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch');
  }

  const body = result.data as any;

  // Unwrap common response envelopes so callers receive useful payloads directly
  if (body && typeof body === 'object') {
    if (Array.isArray(body.users)) return body.users as T;
    if (Array.isArray(body.products)) return body.products as T;
    if (Array.isArray(body.categories)) return body.categories as T;
    if (Array.isArray(body.vendors)) return body.vendors as T;
    if (body.user) return body.user as T;
    if (body.product) return body.product as T;
    if (body.cart) return body.cart as T;
    if (body.orders) return body.orders as T;
    if (body.bookings) return body.bookings as T;
  }

  return body as T;
};

export const api = {
  // Products
  getProducts: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/api/products${queryString}`);
  },
  getProduct: (id: string) => apiRequest(`/api/products/${id}`),
  createProduct: (data: Record<string, unknown>) => 
    apiRequest('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Record<string, unknown>) => 
    apiRequest(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => 
    apiRequest(`/api/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => apiRequest('/api/categories'),
  createCategory: (data: Record<string, unknown>) => 
    apiRequest('/api/categories', { method: 'POST', body: JSON.stringify(data) }),

  // Cart
  getCart: () => apiRequest('/api/cart'),
  addToCart: (productId: string, quantity: number = 1) => 
    apiRequest('/api/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (itemId: string, quantity: number) => 
    apiRequest(`/api/cart/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeFromCart: (itemId: string) => 
    apiRequest(`/api/cart/${itemId}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => apiRequest('/api/orders'),
  getOrder: (id: string) => apiRequest(`/api/orders/${id}`),
  createOrder: (data: Record<string, unknown>) => 
    apiRequest('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, status: string) => 
    apiRequest(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Bookings
  getBookings: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/api/bookings${queryString}`);
  },
  createBooking: (data: Record<string, unknown>) => 
    apiRequest('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBookingStatus: (id: string, status: string) => 
    apiRequest(`/api/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Vendors
  getVendors: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/api/vendors${queryString}`);
  },
  getVendor: (id: string) => apiRequest(`/api/vendors/${id}`),
  updateVendorServices: (data: Record<string, unknown>) => 
    apiRequest('/api/vendors/me/services', { method: 'PATCH', body: JSON.stringify(data) }),

  // Admin
  getAdminVendors: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/api/admin/vendors${queryString}`);
  },
  updateVendorStatus: (id: string, status: string) => 
    apiRequest(`/api/admin/vendors/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminUsers: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/api/admin/users${queryString}`);
  },
  getAdminReports: () => apiRequest('/api/admin/reports'),
};

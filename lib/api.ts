export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: HeadersInit = {
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

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || 'Request failed' };
    }
  } catch (error) {
    console.error('API request error:', error);
    return { success: false, error: 'An error occurred' };
  }
}

export const fetcher = async (url: string) => {
  const result = await apiRequest(url);
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch');
  }
  return result.data;
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

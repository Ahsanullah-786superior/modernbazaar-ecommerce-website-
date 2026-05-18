 // ─── frontend/src/lib/api.ts ───────────────────────────────────────
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sirf /auth/ endpoints pe logout karo
      const url = error.config?.url || ''
      const isAuthEndpoint = url.includes('/auth/')
      if (isAuthEndpoint) {
        Cookies.remove('auth_token')
        if (typeof window !== 'undefined') window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient

// ─── Auth API ──────────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),
  getProfile: () => apiClient.get('/auth/profile'),
  logout: () => apiClient.post('/auth/logout'),
}

// ─── Products API ──────────────────────────────────────────────────
export const productsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/products', { params }),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  getBySlug: (slug: string) => apiClient.get(`/products/slug/${slug}`),
  getFeatured: () => apiClient.get('/products/featured'),
  getTrending: () => apiClient.get('/products/trending'),
  create: (data: unknown) => apiClient.post('/products', data),
  update: (id: string, data: unknown) => apiClient.patch(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
}

// ─── Categories API ────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
  getById: (id: string) => apiClient.get(`/categories/${id}`),
  create: (data: unknown) => apiClient.post('/categories', data),
  update: (id: string, data: unknown) => apiClient.patch(`/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
}

// ─── Orders API ────────────────────────────────────────────────────
export const ordersApi = {
  create: (data: unknown) => apiClient.post('/orders', data),
  getMyOrders: () => apiClient.get('/orders/my'),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/orders', { params }),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/orders/${id}/status`, { status }),
}

// ─── Stripe API ────────────────────────────────────────────────────
export const stripeApi = {
  createPaymentIntent: (data: {
    items: { productId: string; quantity: number }[]
    currency?: string
  }) => apiClient.post('/stripe/create-payment-intent', data),

  confirmOrder: (data: {
    paymentIntentId: string
    items: { productId: string; quantity: number }[]
    shippingAddress: {
      name: string; address: string; city: string
      state: string; zipCode: string; country: string
    }
  }) => apiClient.post('/stripe/confirm-order', data),
}
// ─── Product Types ────────────────────────────────────────────────
export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: Category
  tags: string[]
  rating: number
  reviewCount: number
  stock: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest'
  page?: number
  limit?: number
  search?: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

// ─── Category Types ───────────────────────────────────────────────
export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image: string
  productCount?: number
}

// ─── Cart Types ───────────────────────────────────────────────────
export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
}

// ─── Auth Types ───────────────────────────────────────────────────
export interface User {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatar?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

// ─── Order Types ──────────────────────────────────────────────────
export interface OrderItem {
  product: Product
  quantity: number
  price: number
}

export interface ShippingAddress {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Order {
  _id: string
  user: string
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: 'card' | 'paypal' | 'cod'
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

export interface CreateOrderDto {
  items: { productId: string; quantity: number }[]
  shippingAddress: ShippingAddress
  paymentMethod: 'card' | 'paypal' | 'cod'
}

// ─── API Types ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

// ─── Review Types ─────────────────────────────────────────────────
export interface Review {
  _id: string
  user: { name: string; avatar?: string }
  product: string
  rating: number
  title: string
  body: string
  createdAt: string
}

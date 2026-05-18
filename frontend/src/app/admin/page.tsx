'use client'

/**
 * frontend/src/app/admin/page.tsx
 *
 * REPLACE your existing admin page with this file.
 *
 * What's new / changed:
 *  - Orders section: now loads REAL orders from the API (was MOCK_ORDERS).
 *  - Orders: status update dropdown works (calls PATCH /orders/:id/status).
 *  - Orders: detail modal with full order info.
 *  - Dashboard: recent orders also pulled from real API.
 *  - Products & Categories CRUD: unchanged (already real).
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  TrendingUp, Plus, Pencil, Trash2, Search, Eye,
  Loader2, AlertCircle, X, ChevronLeft, ChevronRight,
  RefreshCw,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import ProductForm from '@/components/admin/ProductForm'
import CategoryForm from '@/components/admin/CategoryForm'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import { productsApi, categoriesApi, ordersApi } from '@/lib/api'
import { Product, Category, Order } from '@/types'
import { formatPrice } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Package,         label: 'Products',  id: 'products'  },
  { icon: Tag,             label: 'Categories', id: 'categories' },
  { icon: ShoppingBag,     label: 'Orders',    id: 'orders'    },
  { icon: Users,           label: 'Users',     id: 'users'     },
]

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
type OrderStatus = typeof ORDER_STATUSES[number]

const STATUS_COLORS: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30',
  processing:  'bg-blue-100   text-blue-700   dark:bg-blue-900/30',
  shipped:     'bg-purple-100 text-purple-700  dark:bg-purple-900/30',
  delivered:   'bg-green-100  text-green-700  dark:bg-green-900/30',
  cancelled:   'bg-red-100    text-red-700    dark:bg-red-900/30',
  active:      'bg-green-100  text-green-700  dark:bg-green-900/30',
  out_of_stock:'bg-red-100    text-red-700    dark:bg-red-900/30',
}

// ── Order Detail Modal ─────────────────────────────────────────────
function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order
  onClose: () => void
  onStatusChange: (id: string, status: string) => Promise<void>
}) {
  const [updating, setUpdating] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(order.status)

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      await onStatusChange(order._id, newStatus)
      setCurrentStatus(newStatus as OrderStatus)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold">Order Details</h2>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{order._id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status changer */}
          <div>
            <p className="text-sm font-medium mb-2">Order Status</p>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={updating}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                    currentStatus === s
                      ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  } disabled:opacity-60`}
                >
                  {updating && currentStatus === s ? (
                    <Loader2 className="w-3 h-3 animate-spin inline-block mr-1" />
                  ) : null}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-sm font-medium mb-3">Items</p>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.product?.name || 'Product'}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium mb-2">Shipping Address</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress.name}<br />
              {order.shippingAddress.address}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span><span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border pt-2 mt-1">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="text-xs text-muted-foreground">
            <p>Payment: <span className="capitalize">{order.paymentMethod}</span></p>
            <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Main Admin Page
// ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard')

  // ── Products state ────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  // ── Categories state ──────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)

  // ── Orders state ──────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  // ── Dashboard / recent orders ─────────────────────────────────
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  // ── Load functions ─────────────────────────────────────────────
  // Define all hooks BEFORE auth check
  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true)
    try {
      const res = await productsApi.getAll({ limit: 100 })
      setProducts(res.data.products)
    } catch { /* handled silently */ }
    finally { setIsLoadingProducts(false) }
  }, [])

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true)
    try {
      const res = await categoriesApi.getAll()
      setCategories(res.data)
    } catch { }
    finally { setIsLoadingCategories(false) }
  }, [])

  const loadOrders = useCallback(async (page = 1, status = '') => {
    setIsLoadingOrders(true)
    try {
      const params: Record<string, unknown> = { page, limit: 15 }
      if (status) params.status = status
      const res = await ordersApi.getAll(params)
      setOrders(res.data.orders)
      setOrdersTotal(res.data.total)
      setOrdersTotalPages(res.data.totalPages)
      setOrdersPage(page)
    } catch { }
    finally { setIsLoadingOrders(false) }
  }, [])

  const loadRecentOrders = useCallback(async () => {
    setIsLoadingRecent(true)
    try {
      const res = await ordersApi.getAll({ page: 1, limit: 5 })
      setRecentOrders(res.data.orders)
    } catch { }
    finally { setIsLoadingRecent(false) }
  }, [])

  // ── Section change ─────────────────────────────────────────────
  useEffect(() => {
    if (activeSection === 'products') loadProducts()
    else if (activeSection === 'categories') loadCategories()
    else if (activeSection === 'orders') loadOrders(1, orderStatusFilter)
    else if (activeSection === 'dashboard') loadRecentOrders()
  }, [activeSection])

  // ── Auth check after all hooks are defined ────────────────────
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/auth/login')
      return
    }
    if (isAuthenticated && user?.role !== 'admin') {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  if (isAuthenticated === false || (isAuthenticated && user?.role !== 'admin')) {
    return null
  }

  // ── Order helpers ──────────────────────────────────────────────
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    setUpdatingOrderId(id)
    try {
      await ordersApi.updateStatus(id, status)
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: status as OrderStatus } : o))
      )
      setRecentOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: status as OrderStatus } : o))
      )
      if (selectedOrder?._id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, status: status as OrderStatus } : null)
      }
    } catch {
      // toast.error handled by global interceptor
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleOrderStatusFilter = (status: string) => {
    setOrderStatusFilter(status)
    loadOrders(1, status)
  }

  // ── Product helpers ────────────────────────────────────────────
  const handleCreateProduct = () => { setEditingProduct(null); setShowProductForm(true) }
  const handleEditProduct = (p: Product) => { setEditingProduct(p); setShowProductForm(true) }
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    setDeletingProductId(id)
    try {
      await productsApi.delete(id)
      setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch { }
    finally { setDeletingProductId(null) }
  }

  // ── Category helpers ───────────────────────────────────────────
  const handleCreateCategory = () => { setEditingCategory(null); setShowCategoryForm(true) }
  const handleEditCategory = (c: Category) => { setEditingCategory(c); setShowCategoryForm(true) }
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return
    setDeletingCategoryId(id)
    try {
      await categoriesApi.delete(id)
      setCategories((prev) => prev.filter((c) => c._id !== id))
    } catch { }
    finally { setDeletingCategoryId(null) }
  }

  // ── Filtered lists ─────────────────────────────────────────────
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // ─────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 flex">
        {/* Sidebar */}
        <aside className="w-16 lg:w-56 bg-card border-r border-border flex-shrink-0 flex flex-col pt-6 pb-6 sticky top-16 h-[calc(100vh-4rem)]">
          <div className="px-3 lg:px-4 mb-6 hidden lg:block">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Admin Panel</p>
          </div>
          <nav className="flex-1 space-y-1 px-2">
            {SIDEBAR_ITEMS.map(({ icon: Icon, label, id }) => (
              <button
                key={id}
                onClick={() => { setActiveSection(id); setSearchQuery('') }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden lg:block">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">

          {/* ── DASHBOARD ──────────────────────────────────────── */}
          {activeSection === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-display text-2xl font-semibold mb-6">Dashboard</h1>

              {/* Stats (static for now — wire up to aggregation endpoint if needed) */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Orders', value: ordersTotal || '—', icon: ShoppingBag },
                  { label: 'Products', value: products.length || '—', icon: Package },
                  { label: 'Categories', value: categories.length || '—', icon: Tag },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <p className="font-display text-2xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold">Recent Orders</h2>
                  <button
                    onClick={() => setActiveSection('orders')}
                    className="text-xs text-primary hover:underline"
                  >
                    View all
                  </button>
                </div>

                {isLoadingRecent ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">No orders yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                            <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {recentOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{order._id.slice(-8).toUpperCase()}</td>
                            <td className="px-6 py-3 font-medium">
                              {typeof order.user === 'object' && (order.user as any)?.name
                                ? (order.user as any).name
                                : order.shippingAddress?.name || '—'}
                            </td>
                            <td className="px-6 py-3 font-semibold">{formatPrice(order.total)}</td>
                            <td className="px-6 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-muted-foreground text-xs">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── PRODUCTS ───────────────────────────────────────── */}
          {activeSection === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-semibold">Products</h1>
                <button
                  onClick={handleCreateProduct}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Package className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No products found</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {['Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                            <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredProducts.map((product) => (
                          <tr key={product._id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4 font-medium">{product.name}</td>
                            <td className="px-6 py-4 text-muted-foreground">{product.category?.name || '—'}</td>
                            <td className="px-6 py-4 font-semibold">{formatPrice(product.price)}</td>
                            <td className="px-6 py-4">
                              <span className={product.stock === 0 ? 'text-red-500' : product.stock < 20 ? 'text-amber-500' : 'text-green-500'}>
                                {product.stock === 0 ? 'Out of stock' : product.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                                {product.stock > 0 ? 'Active' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => router.push(`/products/${product.slug}`)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="View">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleEditProduct(product)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary" aria-label="Edit">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteProduct(product._id)} disabled={deletingProductId === product._id} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50" aria-label="Delete">
                                  {deletingProductId === product._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── CATEGORIES ─────────────────────────────────────── */}
          {activeSection === 'categories' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-semibold">Categories</h1>
                <button
                  onClick={handleCreateCategory}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories…"
                  className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {isLoadingCategories ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Tag className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No categories found</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {['Image', 'Name', 'Slug', 'Products', 'Actions'].map((h) => (
                            <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredCategories.map((category) => (
                          <tr key={category._id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4">
                              {category.image ? (
                                <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <Tag className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium">{category.name}</td>
                            <td className="px-6 py-4 text-muted-foreground">{category.slug}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {category.productCount || 0} Products
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleEditCategory(category)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteCategory(category._id)} disabled={deletingCategoryId === category._id} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50">
                                  {deletingCategoryId === category._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ORDERS ─────────────────────────────────────────── */}
          {activeSection === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-display text-2xl font-semibold">Orders</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{ordersTotal} total orders</p>
                </div>
                <button
                  onClick={() => loadOrders(ordersPage, orderStatusFilter)}
                  className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Status filter tabs */}
              <div className="flex gap-2 flex-wrap mb-4">
                {['', ...ORDER_STATUSES].map((s) => (
                  <button
                    key={s || 'all'}
                    onClick={() => handleOrderStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                      orderStatusFilter === s
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {s || 'All'}
                  </button>
                ))}
              </div>

              {isLoadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {orders.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        No orders found.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {orders.map((order) => (
                              <tr key={order._id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                  {order._id.slice(-8).toUpperCase()}
                                </td>
                                <td className="px-6 py-4 font-medium">
                                  {typeof order.user === 'object' && (order.user as any)?.name
                                    ? (order.user as any).name
                                    : order.shippingAddress?.name || '—'}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                </td>
                                <td className="px-6 py-4 font-semibold">{formatPrice(order.total)}</td>
                                <td className="px-6 py-4">
                                  {/* Inline quick-change dropdown */}
                                  <select
                                    value={order.status}
                                    disabled={updatingOrderId === order._id}
                                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 focus:outline-none cursor-pointer capitalize ${STATUS_COLORS[order.status]} disabled:opacity-60`}
                                  >
                                    {ORDER_STATUSES.map((s) => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                  {updatingOrderId === order._id && (
                                    <Loader2 className="inline-block w-3 h-3 ml-1 animate-spin" />
                                  )}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground text-xs">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {ordersTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button
                        onClick={() => loadOrders(ordersPage - 1, orderStatusFilter)}
                        disabled={ordersPage <= 1}
                        className="p-2 rounded-xl border border-border hover:bg-muted disabled:opacity-40 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-muted-foreground">
                        Page {ordersPage} of {ordersTotalPages}
                      </span>
                      <button
                        onClick={() => loadOrders(ordersPage + 1, orderStatusFilter)}
                        disabled={ordersPage >= ordersTotalPages}
                        className="p-2 rounded-xl border border-border hover:bg-muted disabled:opacity-40 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── USERS placeholder ───────────────────────────────── */}
          {activeSection === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p className="text-4xl mb-3">🚧</p>
              <p className="font-semibold">Users Management</p>
              <p className="text-sm">Coming soon.</p>
            </motion.div>
          )}
        </main>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <ProductForm
        product={editingProduct}
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        onSuccess={loadProducts}
      />
      <CategoryForm
        category={editingCategory}
        isOpen={showCategoryForm}
        onClose={() => setShowCategoryForm(false)}
        onSuccess={loadCategories}
      />

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleUpdateOrderStatus}
          />
        )}
      </AnimatePresence>
    </>
  )
}

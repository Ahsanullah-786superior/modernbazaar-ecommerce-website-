import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CartItem, Product, User } from '@/types'
import Cookies from 'js-cookie'

// ─── Cart Store ────────────────────────────────────────────────────
interface CartStore {
  items: CartItem[]
  isOpen: boolean
  subtotal: number
  itemCount: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
}

// Helper to calculate subtotal and itemCount from items
const calcTotals = (items: CartItem[]) => ({
  subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
})

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      subtotal: 0,
      itemCount: 0,

      addItem: (product, quantity = 1) => {
        const items = get().items
        const existingIndex = items.findIndex((i) => i.product._id === product._id)
        let updated: CartItem[]

        if (existingIndex >= 0) {
          updated = [...items]
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          }
        } else {
          updated = [...items, { product, quantity }]
        }

        set({ items: updated, ...calcTotals(updated) })
      },

      removeItem: (productId) => {
        const updated = get().items.filter((i) => i.product._id !== productId)
        set({ items: updated, ...calcTotals(updated) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        const updated = get().items.map((i) =>
          i.product._id === productId ? { ...i, quantity } : i
        )
        set({ items: updated, ...calcTotals(updated) })
      },

      clearCart: () => set({ items: [], subtotal: 0, itemCount: 0 }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: 'modern-bazaar-cart',
      storage: createJSONStorage(() => localStorage),
      // Rehydrate totals after loading from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          const totals = calcTotals(state.items)
          state.subtotal = totals.subtotal
          state.itemCount = totals.itemCount
        }
      },
    }
  )
)

// ─── Auth Store ────────────────────────────────────────────────────
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        Cookies.set('auth_token', token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
        set({ user, token, isAuthenticated: true })
      },

      clearAuth: () => {
        Cookies.remove('auth_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'modern-bazaar-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ─── UI Store ──────────────────────────────────────────────────────
interface UIStore {
  searchOpen: boolean
  mobileMenuOpen: boolean
  toggleSearch: () => void
  toggleMobileMenu: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  searchOpen: false,
  mobileMenuOpen: false,
  toggleSearch: () => set({ searchOpen: !get().searchOpen }),
  toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),
}))

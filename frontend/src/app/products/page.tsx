'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import ProductCard, { ProductCardSkeleton } from '@/components/product/ProductCard'
import { productsApi, categoriesApi } from '@/lib/api'
import type { Product, ProductFilters, Category } from '@/types'

export const dynamic = 'force-dynamic'

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
]

// ─── Filter sidebar ────────────────────────────────────────────────
function FilterPanel({
  filters,
  categories,
  onChange,
  onClose,
}: {
  filters: ProductFilters
  categories: Category[]
  onChange: (f: Partial<ProductFilters>) => void
  onClose?: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => onChange({ category: '' })}
            className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !filters.category
                ? 'bg-primary text-white font-medium'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onChange({ category: cat.slug })}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                filters.category === cat.slug
                  ? 'bg-primary text-white font-medium'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onChange({ minPrice: Number(e.target.value) || undefined })}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange({ maxPrice: Number(e.target.value) || undefined })}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider">Min Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => onChange({ minRating: rating })}
              className={`flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                filters.minRating === rating
                  ? 'bg-primary text-white'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {'⭐'.repeat(rating)} & up
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange({ category: '', minPrice: undefined, maxPrice: undefined, minRating: undefined })}
        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
      >
        Reset Filters
      </button>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const LIMIT = 12

  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
    sort: 'newest',
    page: 1,
    limit: LIMIT,
  })

  const [search, setSearch] = useState('')

  // Load categories from real API
  useEffect(() => {
    categoriesApi.getAll().then((res) => {
      setCategories(res.data)
    }).catch(console.error)
  }, [])

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setFilters((prev) => ({
      ...prev,
      category: params.get('category') || '',
    }))
    setSearch(params.get('search') || '')
  }, [])

  // Fetch products from real API
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {
        ...filters,
        limit: LIMIT,
      }
      if (search) params.search = search

      const res = await productsApi.getAll(params)
      setProducts(res.data.products)
      setTotal(res.data.total)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateFilter = (update: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...update, page: 1 }))
    setPage(1)
  }

  const currentCategoryLabel = categories.find((c) => c.slug === filters.category)?.name

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        {/* Page header */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="font-display text-3xl lg:text-4xl font-semibold mb-2">
              {currentCategoryLabel || 'All Products'}
            </h1>
            <p className="text-muted-foreground">{total} products found</p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar (desktop) */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <FilterPanel
                  filters={filters}
                  categories={categories}
                  onChange={updateFilter}
                />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </button>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={filters.sort}
                      onChange={(e) => updateFilter({ sort: e.target.value as ProductFilters['sort'] })}
                      className="appearance-none px-4 py-2.5 pr-8 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                      {SORT_OPTIONS.map(({ label, value }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Products grid */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {[...Array(LIMIT)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-4xl mb-4">😕</p>
                  <p className="font-semibold text-lg mb-2">No products found</p>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your filters or search term.
                  </p>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
                >
                  <AnimatePresence>
                    {products.map((product, i) => (
                      <ProductCard key={product._id} product={product} index={i} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Pagination */}
              {!loading && total > LIMIT && (
                <div className="flex justify-center gap-2 mt-12">
                  {[...Array(Math.ceil(total / LIMIT))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPage(i + 1); updateFilter({ page: i + 1 }) }}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        page === i + 1
                          ? 'bg-primary text-white'
                          : 'border border-border hover:bg-muted'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFiltersOpen(false)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterPanel
                  filters={filters}
                  categories={categories}
                  onChange={(f) => { updateFilter(f); setFiltersOpen(false) }}
                  onClose={() => setFiltersOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

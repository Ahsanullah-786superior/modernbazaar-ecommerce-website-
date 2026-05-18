'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, FreeMode } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import Image from 'next/image'
import { Star, ShoppingCart, Heart, Share2, Check, Truck, RotateCcw, Shield, Minus, Plus } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/free-mode'
import 'swiper/css/thumbs'

// ─── Mock product data (replace with API call) ─────────────────────
const MOCK_PRODUCT = {
  _id: '1',
  name: 'AirPods Pro Max — Midnight Black',
  slug: 'airpods-pro-max',
  description: `Experience audio perfection with our premium over-ear headphones. 
  Featuring Active Noise Cancellation (ANC) that cuts through ambient noise, 
  a custom acoustic design for pure high-fidelity audio, and Transparency mode 
  so you can hear the world around you whenever you need to.
  
  Up to 20 hours of listening time with ANC enabled. The comfortable over-ear 
  design features breathable cushions and an adaptive EQ that automatically tunes 
  music to the seal of the ear cushions.`,
  price: 549,
  compareAtPrice: 649,
  images: [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
  ],
  category: { _id: 'c1', name: 'Earbuds', slug: 'earbuds', image: '' },
  tags: ['wireless', 'premium', 'noise-cancelling'],
  rating: 4.8,
  reviewCount: 2341,
  stock: 23,
  featured: true,
  createdAt: '',
  updatedAt: '',
  specs: {
    'Driver': '40mm dynamic',
    'Frequency Response': '20Hz – 20kHz',
    'Battery Life': '20 hours (ANC on)',
    'Connectivity': 'Bluetooth 5.3',
    'Weight': '385g',
    'Charging': 'USB-C, 30 min = 5 hrs',
  },
}

const MOCK_REVIEWS = [
  { _id: 'r1', user: { name: 'Sarah M.' }, rating: 5, title: 'Absolutely incredible!', body: 'The best headphones I have ever owned. The sound quality is mind-blowing.', createdAt: '2024-02-10' },
  { _id: 'r2', user: { name: 'James K.' }, rating: 4, title: 'Great but pricey', body: 'Sound is outstanding. ANC is top-tier. Worth every penny if you can afford it.', createdAt: '2024-01-22' },
  { _id: 'r3', user: { name: 'Priya L.' }, rating: 5, title: 'Game changer for WFH', body: 'The transparency mode is magic. I can hear my phone ring without removing them.', createdAt: '2024-01-15' },
]

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCartStore()
  const product = MOCK_PRODUCT
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  const handleAddToCart = () => {
    addItem(product as any, quantity)
    setAddedToCart(true)
    toast.success(`${product.name} added to cart!`, { icon: '🛍️' })
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
            {/* ── Image gallery ── */}
            <div>
              {/* Main swiper */}
              <Swiper
                modules={[Navigation, Thumbs, FreeMode]}
                thumbs={{ swiper: thumbsSwiper }}
                navigation
                className="rounded-2xl overflow-hidden mb-4 aspect-square bg-muted"
              >
                {product.images.map((src, i) => (
                  <SwiperSlide key={i}>
                    <div className="relative aspect-square">
                      <Image
                        src={src}
                        alt={`${product.name} - image ${i + 1}`}
                        fill
                        className="object-cover"
                        priority={i === 0}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Thumbnails */}
              <Swiper
                onSwiper={setThumbsSwiper}
                modules={[FreeMode, Thumbs]}
                freeMode
                watchSlidesProgress
                slidesPerView={4}
                spaceBetween={8}
                className="h-20"
              >
                {product.images.map((src, i) => (
                  <SwiperSlide key={i} className="cursor-pointer rounded-xl overflow-hidden opacity-60 [&.swiper-slide-thumb-active]:opacity-100 [&.swiper-slide-thumb-active]:ring-2 [&.swiper-slide-thumb-active]:ring-primary transition-all">
                    <div className="relative h-20">
                      <Image src={src} alt="" fill className="object-cover" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* ── Product info ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Breadcrumb */}
              <p className="text-sm text-muted-foreground mb-4">
                Home / {product.category.name} / {product.name}
              </p>

              {/* Category badge */}
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                {product.category.name}
              </span>

              <h1 className="font-display text-3xl lg:text-4xl font-semibold mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.compareAtPrice}
                    </span>
                    <span className="px-2 py-1 bg-primary text-white text-sm font-bold rounded-full">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                {product.description.split('\n')[0]}
              </p>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span className="text-sm font-medium">
                  {product.stock > 10
                    ? 'In Stock'
                    : product.stock > 0
                    ? `Only ${product.stock} left!`
                    : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity + Add to cart */}
              <div className="flex items-center gap-4 mb-6">
                {/* Quantity selector */}
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 hover:bg-muted transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-3 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-4 py-3 hover:bg-muted transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to cart */}
                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  whileTap={{ scale: 0.97 }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-all ${
                    addedToCart
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-white hover:bg-primary/90'
                  } disabled:opacity-50`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" /> Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </>
                  )}
                </motion.button>

                {/* Wishlist */}
                <button
                  className="p-3.5 border border-border rounded-xl hover:bg-muted transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-5 h-5" />
                </button>

                {/* Share */}
                <button
                  className="p-3.5 border border-border rounded-xl hover:bg-muted transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { Icon: Truck, label: 'Free Shipping', sub: 'Orders $100+' },
                  { Icon: RotateCcw, label: '30-Day Returns', sub: 'Hassle free' },
                  { Icon: Shield, label: 'Secure Pay', sub: 'SSL encrypted' },
                ].map(({ Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50 text-center"
                  >
                    <Icon className="w-5 h-5 text-primary mb-1" />
                    <p className="text-xs font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Specs table */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-muted/50 border-b border-border">
                  <h3 className="font-semibold text-sm">Specifications</h3>
                </div>
                <div className="divide-y divide-border">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex px-4 py-2.5 text-sm">
                      <span className="w-40 text-muted-foreground flex-shrink-0">{key}</span>
                      <span className="font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Reviews ── */}
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="font-display text-3xl font-semibold mb-8">Customer Reviews</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_REVIEWS.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-5 rounded-2xl border border-border bg-card"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {review.user.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.user.name}</p>
                      <p className="text-xs text-muted-foreground">{review.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  <p className="font-semibold text-sm mb-1">{review.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

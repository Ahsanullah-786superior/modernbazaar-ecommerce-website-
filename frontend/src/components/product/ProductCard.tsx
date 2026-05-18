'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/4 rounded" />
      </div>
    </div>
  )
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore()
  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      )
    : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} added to cart!`, { icon: '🛍️' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/products/${product.slug}`} className="block group">
        <div className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-shadow duration-300">
          {/* Image container */}
          <div className="relative aspect-square bg-muted overflow-hidden">
            {product.images?.[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWjZRRktmRkVGYGJdaVVnaW9ub0lqfXFobGprbmf/2wBDARUXFx4aHjshISdnRkZGZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2f/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k="
              />
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discount && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Low Stock
                </span>
              )}
              {product.stock === 0 && (
                <span className="bg-muted-foreground text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Sold Out
                </span>
              )}
            </div>

            {/* Hover actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="w-8 h-8 bg-white/90 dark:bg-black/80 rounded-full flex items-center justify-center shadow hover:text-primary transition-colors"
                aria-label="Wishlist"
                onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {/* Add to cart overlay */}
            {product.stock > 0 && (
              <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 bg-primary/95 backdrop-blur-sm text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
              {typeof product.category === 'string' ? product.category : product.category?.name}
            </p>
            <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating)
                        ? 'text-amber-400 fill-amber-400'
                        : i < product.rating
                        ? 'text-amber-400 fill-amber-200'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {product.rating} ({product.reviewCount?.toLocaleString()})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, subtotal } = useCartStore()

  const tax = subtotal * 0.08
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = subtotal + tax + shipping

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-background flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">Your Cart</h2>
                {items.length > 0 && (
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={toggleCart}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-6">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full gap-4 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground">
                      Looks like you haven't added anything yet.
                    </p>
                  </div>
                  <button
                    onClick={toggleCart}
                    className="mt-2 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Start Shopping
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map(({ product, quantity }) => (
                      <motion.div
                        key={product._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4 p-3 rounded-xl border border-border"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {product.images?.[0] && (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {typeof product.category === 'string'
                              ? product.category
                              : product.category?.name}
                          </p>
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="font-bold text-primary mt-1">
                            {formatPrice(product.price)}
                          </p>

                          {/* Quantity + Remove */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 border border-border rounded-full px-2 py-1">
                              <button
                                onClick={() => updateQuantity(product._id, quantity - 1)}
                                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                                aria-label="Decrease"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium w-4 text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product._id, quantity + 1)}
                                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                                aria-label="Increase"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(product._id)}
                              className="p-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Summary + CTA */}
            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5 space-y-4">
                {/* Price breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? '🎉 Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {subtotal < 100 && (
                    <p className="text-xs text-primary bg-primary/5 rounded-lg px-3 py-2">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Link
                    href="/checkout"
                    onClick={toggleCart}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
                  >
                    Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={toggleCart}
                    className="flex items-center justify-center w-full py-3 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

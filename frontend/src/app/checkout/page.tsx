'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ChevronRight, CreditCard, Truck, CheckCircle,
  Loader2, Package, ShieldCheck,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { useCartStore, useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'
import { stripeApi } from '@/lib/api'

import { loadStripe } from '@stripe/stripe-js'
import {
  Elements, CardElement, useStripe, useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

const checkoutSchema = z.object({
  name:          z.string().min(2, 'Name is required'),
  email:         z.string().email('Valid email required'),
  phone:         z.string().min(7, 'Phone is required'),
  address:       z.string().min(5, 'Address is required'),
  city:          z.string().min(2, 'City is required'),
  state:         z.string().min(2, 'State is required'),
  zipCode:       z.string().min(4, 'Zip code required'),
  country:       z.string().min(2, 'Country is required'),
  paymentMethod: z.enum(['card', 'cod']),
})

type CheckoutForm = z.infer<typeof checkoutSchema>
const STEPS = ['Shipping', 'Payment', 'Review']
import { forwardRef } from 'react'

const FormField = forwardRef<HTMLInputElement, {
  label: string; error?: string
} & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ label, error, ...props }, ref) => (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        ref={ref}
        className={`w-full px-4 py-3 rounded-xl border ${
          error ? 'border-destructive' : 'border-border'
        } bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm`}
        {...props}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
)
FormField.displayName = 'FormField'

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: 'var(--foreground, #1a1a1a)',
      fontFamily: 'inherit',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
}

function CheckoutInner() {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

  const [step, setStep] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [breakdown, setBreakdown] = useState<{
    subtotal: number; tax: number; shipping: number; total: number
  } | null>(null)
  const [fetchingIntent, setFetchingIntent] = useState(false)

  const { items, subtotal, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()

  const tax = subtotal * 0.08
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = subtotal + tax + shipping

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    trigger,           // ← manual validation trigger
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onSubmit',  // ← only show errors on submit
    defaultValues: {
      name:          user?.name  || '',
      email:         user?.email || '',
      phone:         '',
      address:       '',
      city:          '',
      state:         '',
      zipCode:       '',
      country:       '',
      paymentMethod: 'card',
    },
  })

  const paymentMethod = watch('paymentMethod')

  // Shipping fields to validate on step 0
  const SHIPPING_FIELDS: (keyof CheckoutForm)[] = [
    'name', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country',
  ]

  // Fetch PaymentIntent when entering payment step
  useEffect(() => {
    if (step === 1 && paymentMethod === 'card' && !clientSecret) {
      setFetchingIntent(true)
      stripeApi
        .createPaymentIntent({
          items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        })
        .then((res) => {
          setClientSecret(res.data.clientSecret)
          setBreakdown(res.data.breakdown)
        })
        .catch(() => toast.error('Could not initialize payment. Please try again.'))
        .finally(() => setFetchingIntent(false))
    }
  }, [step, paymentMethod, clientSecret, items])

  // Handle Continue — validate current step fields before moving forward
  const handleContinue = async () => {
    if (step === 0) {
      const valid = await trigger(SHIPPING_FIELDS)
      if (!valid) return   // stop if any shipping field is invalid
    }
    setStep((s) => s + 1)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in before placing an order.')
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  const onSubmit = async (data: CheckoutForm) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to place an order.')
      router.push('/auth/login')
      return
    }

    setPlacing(true)
    try {
      const shippingAddress = {
        name: data.name, address: data.address, city: data.city,
        state: data.state, zipCode: data.zipCode, country: data.country,
      }

      if (data.paymentMethod === 'card') {
        if (!stripe || !elements || !clientSecret) {
          toast.error('Stripe is not ready. Please refresh and try again.')
          return
        }
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) { toast.error('Card element not found.'); return }

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: { card: cardElement, billing_details: { name: data.name, email: data.email } } },
        )

        if (stripeError) { toast.error(stripeError.message || 'Payment failed.'); return }
        if (paymentIntent?.status !== 'succeeded') { toast.error('Payment was not completed.'); return }

        const orderRes = await stripeApi.confirmOrder({
          paymentIntentId: paymentIntent.id,
          items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
          shippingAddress,
        })
        setOrderId(orderRes.data._id)
      } else {
        const { ordersApi } = await import('@/lib/api')
        const orderRes = await ordersApi.create({
          items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
          shippingAddress,
          paymentMethod: 'cod',
        })
        setOrderId(orderRes.data._id)
      }

      clearCart()
      setPlaced(true)
      toast.success('Order placed successfully! 🎉')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  // Success screen
  if (placed) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md px-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold mb-3">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-2">Thank you for your order. We'll send you a confirmation email shortly.</p>
            {orderId && <p className="font-mono text-xs text-muted-foreground mb-6">Order ID: {orderId}</p>}
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push('/')} className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">Continue Shopping</button>
              <button onClick={() => router.push('/orders')} className="px-6 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">View Orders</button>
            </div>
          </motion.div>
        </main>
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <button onClick={() => router.push('/products')} className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium">Shop Now</button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-0 mb-10 mt-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${i <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-16 sm:w-24 mb-4 mx-2 transition-colors ${i < step ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">

                  {/* Step 0: Shipping */}
                  {step === 0 && (
                    <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-lg">Shipping Information</h2>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField label="Full Name"         error={errors.name?.message}    {...register('name')} />
                        <FormField label="Email" type="email" error={errors.email?.message}  {...register('email')} />
                        <div className="sm:col-span-2">
                          <FormField label="Phone" type="tel" error={errors.phone?.message}  {...register('phone')} />
                        </div>
                        <div className="sm:col-span-2">
                          <FormField label="Street Address"  error={errors.address?.message} {...register('address')} />
                        </div>
                        <FormField label="City"              error={errors.city?.message}    {...register('city')} />
                        <FormField label="State / Province"  error={errors.state?.message}   {...register('state')} />
                        <FormField label="Zip / Postal Code" error={errors.zipCode?.message} {...register('zipCode')} />
                        <FormField label="Country"           error={errors.country?.message} {...register('country')} />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Payment */}
                  {step === 1 && (
                    <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="bg-card border border-border rounded-2xl p-6 space-y-5">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-lg">Payment Method</h2>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
                          { value: 'cod',  label: 'Cash on Delivery',    icon: '💵' },
                        ].map(({ value, label, icon }) => (
                          <label key={value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                            <input type="radio" value={value} className="hidden" {...register('paymentMethod')} />
                            <span className="text-xl">{icon}</span>
                            <span className="text-sm font-medium">{label}</span>
                          </label>
                        ))}
                      </div>

                      {paymentMethod === 'card' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            <span>Secured by Stripe — your card info is never stored on our servers</span>
                          </div>
                          {fetchingIntent ? (
                            <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Initializing secure payment…</span>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl border border-border bg-background">
                              <CardElement options={CARD_ELEMENT_OPTIONS} />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                            🧪 <strong>Test mode:</strong> Use card <code>4242 4242 4242 4242</code>, any future expiry, any CVC.
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'cod' && (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
                          💵 Payment will be collected upon delivery. Please have the exact amount ready.
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: Review */}
                  {step === 2 && (
                    <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <h2 className="font-semibold text-lg mb-2">Review Your Order</h2>
                      <div className="space-y-3">
                        {items.map(({ product, quantity }) => (
                          <div key={product._id} className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                              {product.images[0] && (
                                <Image src={product.images[0]} alt={product.name} width={56} height={56} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                            </div>
                            <p className="font-semibold text-sm">{formatPrice(product.price * quantity)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border pt-4 text-sm">
                        <p className="font-medium mb-1">Shipping to:</p>
                        <p className="text-muted-foreground">
                          {getValues('name')} — {getValues('address')}, {getValues('city')},{' '}
                          {getValues('state')} {getValues('zipCode')}, {getValues('country')}
                        </p>
                      </div>
                      <div className="border-t border-border pt-4 text-sm">
                        <p className="font-medium mb-1">Payment:</p>
                        <p className="text-muted-foreground capitalize">
                          {getValues('paymentMethod') === 'card' ? '💳 Credit / Debit Card (Stripe)' : '💵 Cash on Delivery'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-6">
                  {step > 0 ? (
                    <button type="button" onClick={() => setStep((s) => s - 1)}
                      className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                      Back
                    </button>
                  ) : <div />}

                  {/* Step 0 & 1: Continue button (type=button, manual validation) */}
                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={step === 1 && paymentMethod === 'card' && fetchingIntent}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    /* Step 2: Place Order button (type=submit) */
                    <button
                      type="submit"
                      disabled={placing}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                      {placing ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                      ) : 'Place Order'}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                    <span>{formatPrice(breakdown?.subtotal ?? subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>{formatPrice(breakdown?.tax ?? tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{(breakdown?.shipping ?? shipping) === 0 ? 'Free' : formatPrice(breakdown?.shipping ?? shipping)}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatPrice(breakdown?.total ?? total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  )
}

// ─── stripe/stripe.service.ts ─────────────────────────────────────
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as Stripe from 'stripe'
import { Order, OrderDocument } from '../orders/schemas/order.schema'
import { Product, ProductDocument } from '../products/schemas/product.schema'

@Injectable()
export class StripeService {
  private stripe: any

  constructor(
    private configService: ConfigService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY')
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not defined in .env')
    this.stripe = new (Stripe as any)(secretKey, { apiVersion: '2026-04-22.dahlia' })
  }

  // ─── Create Payment Intent ────────────────────────────────────
  // Called before order is saved. Frontend uses the clientSecret to
  // show Stripe Elements. Order is created after payment succeeds.
  async createPaymentIntent(dto: {
    items: { productId: string; quantity: number }[]
    currency?: string
  }) {
    const { items, currency = 'usd' } = dto

    let subtotal = 0
    const lineItems: { name: string; quantity: number; price: number }[] = []

    for (const item of items) {
      const product = await this.productModel.findById(item.productId)
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`)
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for "${product.name}"`)
      }
      subtotal += product.price * item.quantity
      lineItems.push({ name: product.name, quantity: item.quantity, price: product.price })
    }

    const TAX_RATE = 0.08
    const FREE_SHIPPING_THRESHOLD = 100
    const SHIPPING_COST = 9.99

    const tax = +(subtotal * TAX_RATE).toFixed(2)
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const total = +(subtotal + tax + shipping).toFixed(2)

    // Stripe expects amount in smallest currency unit (cents for USD)
    const amountInCents = Math.round(total * 100)

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      breakdown: { subtotal, tax, shipping, total },
    }
  }

  // ─── Confirm & Create Order After Payment ────────────────────
  async confirmAndCreateOrder(dto: {
    paymentIntentId: string
    items: { productId: string; quantity: number }[]
    shippingAddress: {
      name: string; address: string; city: string
      state: string; zipCode: string; country: string
    }
    userId: string
  }) {
    const { paymentIntentId, items, shippingAddress, userId } = dto

    // Verify payment succeeded with Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException(`Payment not completed. Status: ${paymentIntent.status}`)
    }

    // Build line items & calculate totals
    const lineItems: { product: string; quantity: number; price: number }[] = []
    let subtotal = 0

    for (const item of items) {
      const product = await this.productModel.findById(item.productId)
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`)
      lineItems.push({ product: item.productId, quantity: item.quantity, price: product.price })
      subtotal += product.price * item.quantity
    }

    const tax = +(subtotal * 0.08).toFixed(2)
    const shipping = subtotal >= 100 ? 0 : 9.99
    const total = +(subtotal + tax + shipping).toFixed(2)

    // Create order in DB
    const order = await this.orderModel.create({
      user: userId,
      items: lineItems,
      shippingAddress,
      paymentMethod: 'card',
      subtotal: +subtotal.toFixed(2),
      tax,
      shipping,
      total,
      stripePaymentIntentId: paymentIntentId,
      status: 'processing', // paid orders start as processing
    })

    // Decrement stock
    await Promise.all(
      items.map((item) =>
        this.productModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        }),
      ),
    )

    return order.populate('items.product', 'name images price')
  }

  // ─── Stripe Webhook Handler ───────────────────────────────────
  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET not configured')
    }

    let event: any
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`)
    }

    switch (event.type) {
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any
        console.warn(`Payment failed for intent ${pi.id}`)
        break
      }
      case 'payment_intent.succeeded': {
        // Order is created by the frontend confirm flow, not here.
        // But you can add email notifications, analytics, etc.
        console.log(`PaymentIntent ${(event.data.object as any).id} succeeded`)
        break
      }
    }

    return { received: true }
  }
}

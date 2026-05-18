import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Order, OrderDocument } from './schemas/order.schema'
import { Product, ProductDocument } from '../products/schemas/product.schema'
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto'

const TAX_RATE = 0.08
const FREE_SHIPPING_THRESHOLD = 100
const SHIPPING_COST = 9.99

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // ─── Create order ─────────────────────────────────────────────
  async create(dto: CreateOrderDto, userId: string) {
    // 1. Validate products & build line items
    const lineItems: { product: string; quantity: number; price: number }[] = []
    let subtotal = 0

    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId)
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`)
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for "${product.name}"`)
      }

      lineItems.push({ product: item.productId, quantity: item.quantity, price: product.price })
      subtotal += product.price * item.quantity
    }

    // 2. Calculate totals
    const tax = +(subtotal * TAX_RATE).toFixed(2)
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const total = +(subtotal + tax + shipping).toFixed(2)

    // 3. Create order in DB
    const order = await this.orderModel.create({
      user: userId,
      items: lineItems,
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
      subtotal: +subtotal.toFixed(2),
      tax,
      shipping,
      total,
    })

    // 4. Decrement stock
    await Promise.all(
      dto.items.map((item) =>
        this.productModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        }),
      ),
    )

    return order.populate('items.product', 'name images price')
  }

  // ─── Get my orders ────────────────────────────────────────────
  async findMyOrders(userId: string) {
    return this.orderModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images price slug')
      .lean()
  }

  // ─── Get single order ─────────────────────────────────────────
  async findById(id: string, userId?: string) {
    const filter: Record<string, unknown> = { _id: id }
    if (userId) filter.user = userId // restrict to owner unless admin

    const order = await this.orderModel
      .findOne(filter)
      .populate('items.product', 'name images price slug')
      .populate('user', 'name email')

    if (!order) throw new NotFoundException(`Order #${id} not found`)
    return order
  }

  // ─── Get all orders (admin) ───────────────────────────────────
  async findAll(query: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = query
    const filter: Record<string, unknown> = {}
    if (status) filter.status = status

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email')
        .populate('items.product', 'name images')
        .lean(),
      this.orderModel.countDocuments(filter),
    ])

    return { orders, total, page, totalPages: Math.ceil(total / limit) }
  }

  // ─── Update order status (admin) ──────────────────────────────
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findByIdAndUpdate(
      id, { $set: { status: dto.status } }, { new: true },
    )
    if (!order) throw new NotFoundException(`Order #${id} not found`)
    return order
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'

export type OrderDocument = Order & Document

@Schema({ _id: false })
class ShippingAddress {
  @Prop({ required: true }) name: string
  @Prop({ required: true }) address: string
  @Prop({ required: true }) city: string
  @Prop({ required: true }) state: string
  @Prop({ required: true }) zipCode: string
  @Prop({ required: true }) country: string
}

@Schema({ _id: false })
class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: MongooseSchema.Types.ObjectId

  @Prop({ required: true, min: 1 }) quantity: number
  @Prop({ required: true, min: 0 }) price: number
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[]

  @Prop({ type: ShippingAddress, required: true })
  shippingAddress: ShippingAddress

  @Prop({ enum: ['card', 'paypal', 'cod'], required: true })
  paymentMethod: string

  @Prop({ required: true, min: 0 }) subtotal: number
  @Prop({ required: true, min: 0 }) tax: number
  @Prop({ required: true, min: 0 }) shipping: number
  @Prop({ required: true, min: 0 }) total: number

  @Prop({
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: string

  // Stripe payment intent ID (only for card payments)
  @Prop({ sparse: true })
  stripePaymentIntentId?: string
}

export const OrderSchema = SchemaFactory.createForClass(Order)
OrderSchema.index({ user: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true })
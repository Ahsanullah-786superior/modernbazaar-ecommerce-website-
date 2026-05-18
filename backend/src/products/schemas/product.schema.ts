// ─── schemas/product.schema.ts ────────────────────────────────────
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'

export type ProductDocument = Product & Document

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string

  @Prop({ required: true })
  description: string

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ min: 0 })
  compareAtPrice?: number

  @Prop({ type: [String], default: [] })
  images: string[]

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  category: MongooseSchema.Types.ObjectId

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number

  @Prop({ default: 0 })
  reviewCount: number

  @Prop({ required: true, min: 0, default: 0 })
  stock: number

  @Prop({ default: false })
  featured: boolean
}

export const ProductSchema = SchemaFactory.createForClass(Product)

// Text search index
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' })
ProductSchema.index({ category: 1, price: 1, rating: -1 })

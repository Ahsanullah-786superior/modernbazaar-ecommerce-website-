import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, FilterQuery, SortOrder } from 'mongoose'
import { Product, ProductDocument } from './schemas/product.schema'
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto'

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────
  async create(dto: CreateProductDto): Promise<ProductDocument> {
    const existing = await this.productModel.findOne({ slug: dto.slug })
    if (existing) throw new ConflictException('Product with this slug already exists')
    return this.productModel.create(dto)
  }

  // ─── Find all (with filters, pagination, sorting) ─────────────
  async findAll(query: ProductQueryDto) {
    const { category, minPrice, maxPrice, minRating, sort, page = 1, limit = 12, search, featured } = query
    const skip = (page - 1) * limit

    // Build filter
    const filter: FilterQuery<ProductDocument> = {}

    if (category) filter.category = category
    if (featured !== undefined) filter.featured = featured
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {}
      if (minPrice !== undefined) filter.price.$gte = minPrice
      if (maxPrice !== undefined) filter.price.$lte = maxPrice
    }
    if (minRating !== undefined) filter.rating = { $gte: minRating }
    if (search) filter.$text = { $search: search }

    // Build sort
    const sortMap: Record<string, Record<string, SortOrder>> = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      rating:     { rating: -1 },
      newest:     { createdAt: -1 },
    }
    const sortOptions = sortMap[sort || 'newest'] || { createdAt: -1 }

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug image')
        .lean(),
      this.productModel.countDocuments(filter),
    ])

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  // ─── Find featured ────────────────────────────────────────────
  async findFeatured(limit = 10) {
    return this.productModel
      .find({ featured: true, stock: { $gt: 0 } })
      .sort({ rating: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .lean()
  }

  // ─── Find trending (most reviewed) ────────────────────────────
  async findTrending(limit = 10) {
    return this.productModel
      .find({ stock: { $gt: 0 } })
      .sort({ reviewCount: -1, rating: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .lean()
  }

  // ─── Find by ID ───────────────────────────────────────────────
  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findById(id)
      .populate('category', 'name slug image')
    if (!product) throw new NotFoundException(`Product #${id} not found`)
    return product
  }

  // ─── Find by slug ─────────────────────────────────────────────
  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findOne({ slug })
      .populate('category', 'name slug image')
    if (!product) throw new NotFoundException(`Product "${slug}" not found`)
    return product
  }

  // ─── Update ───────────────────────────────────────────────────
  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel.findByIdAndUpdate(
      id, { $set: dto }, { new: true, runValidators: true },
    ).populate('category', 'name slug')
    if (!product) throw new NotFoundException(`Product #${id} not found`)
    return product
  }

  // ─── Delete ───────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    const product = await this.productModel.findByIdAndDelete(id)
    if (!product) throw new NotFoundException(`Product #${id} not found`)
    return { message: 'Product deleted successfully' }
  }

  // ─── Related products ─────────────────────────────────────────
  async findRelated(productId: string, limit = 4) {
    const product = await this.findById(productId)
    return this.productModel
      .find({ category: product.category, _id: { $ne: productId } })
      .sort({ rating: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .lean()
  }
}

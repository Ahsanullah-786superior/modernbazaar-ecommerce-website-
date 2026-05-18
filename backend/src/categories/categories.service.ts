// ─── categories.service.ts ────────────────────────────────────────
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Category, CategoryDocument } from './schemas/category.schema'
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryModel.findOne({ slug: dto.slug })
    if (existing) throw new ConflictException('Category with this slug already exists')
    return this.categoryModel.create(dto)
  }

  async findAll() {
    return this.categoryModel.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
        },
      },
      {
        $project: {
          products: 0,
        },
      },
      {
        $sort: { name: 1 },
      },
    ])
  }

  async findById(id: string) {
    const cat = await this.categoryModel.findById(id)
    if (!cat) throw new NotFoundException(`Category #${id} not found`)
    return cat
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.categoryModel.findByIdAndUpdate(
      id, { $set: dto }, { new: true, runValidators: true },
    )
    if (!cat) throw new NotFoundException(`Category #${id} not found`)
    return cat
  }

  async remove(id: string) {
    const cat = await this.categoryModel.findByIdAndDelete(id)
    if (!cat) throw new NotFoundException(`Category #${id} not found`)
    return { message: 'Category deleted successfully' }
  }
}

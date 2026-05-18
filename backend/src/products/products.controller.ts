import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
  HttpCode, HttpStatus,
} from '@nestjs/common'
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiResponse, ApiParam, ApiQuery,
} from '@nestjs/swagger'
import { ProductsService } from './products.service'
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/jwt-auth.guard'

// Custom decorator helpers (inline for brevity)
import { SetMetadata } from '@nestjs/common'
export const Public = () => SetMetadata('isPublic', true)
export const Roles = (...roles: string[]) => SetMetadata('roles', roles)

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ─── Public endpoints ──────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products with filters & pagination' })
  @ApiResponse({ status: 200, description: 'Paginated products list' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query)
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured products' })
  findFeatured(@Query('limit') limit?: number) {
    return this.productsService.findFeatured(limit)
  }

  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Get trending products (most reviewed)' })
  findTrending(@Query('limit') limit?: number) {
    return this.productsService.findTrending(limit)
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug)
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  findById(@Param('id') id: string) {
    return this.productsService.findById(id)
  }

  @Get(':id/related')
  @Public()
  @ApiOperation({ summary: 'Get related products' })
  findRelated(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.productsService.findRelated(id, limit)
  }

  // ─── Admin-only endpoints ──────────────────────────────────────

  @Post()
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create a product' })
  @ApiResponse({ status: 201, description: 'Product created' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  @Patch(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update a product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Delete a product' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id)
  }
}

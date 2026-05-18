import {
  IsString, IsNumber, IsOptional, IsBoolean, IsArray,
  Min, Max, MinLength, IsMongoId,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateProductDto {
  @ApiProperty({ example: 'AirPods Pro Max' })
  @IsString()
  @MinLength(2)
  name: string

  @ApiProperty({ example: 'airpods-pro-max' })
  @IsString()
  slug: string

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string

  @ApiProperty({ example: 549 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number

  @ApiPropertyOptional({ example: 649 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  compareAtPrice?: number

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]

  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  @IsMongoId()
  category: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  minRating?: number

  @IsOptional()
  @IsString()
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest'

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 12

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean
}

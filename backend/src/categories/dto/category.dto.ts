import { IsString, IsOptional, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

export class CreateCategoryDto {
  @ApiProperty({ example: 'Kitchen Appliances' })
  @IsString()
  @MinLength(2)
  name: string

  @ApiProperty({ example: 'kitchen-appliances' })
  @IsString()
  slug: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: 'https://images.unsplash.com/...' })
  @IsString()
  image: string
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

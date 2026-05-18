import {
  IsString, IsArray, IsNumber, IsEnum, IsMongoId,
  ValidateNested, Min, ArrayMinSize,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, PartialType } from '@nestjs/swagger'

class ShippingAddressDto {
  @IsString() @ApiProperty() name: string
  @IsString() @ApiProperty() address: string
  @IsString() @ApiProperty() city: string
  @IsString() @ApiProperty() state: string
  @IsString() @ApiProperty() zipCode: string
  @IsString() @ApiProperty() country: string
}

class OrderItemDto {
  @IsMongoId() @ApiProperty() productId: string
  @IsNumber() @Min(1) @Type(() => Number) @ApiProperty() quantity: number
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[]

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @ApiProperty({ type: ShippingAddressDto })
  shippingAddress: ShippingAddressDto

  @IsEnum(['card', 'paypal', 'cod'])
  @ApiProperty({ enum: ['card', 'paypal', 'cod'] })
  paymentMethod: 'card' | 'paypal' | 'cod'
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  @ApiProperty({ enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] })
  status: string
}

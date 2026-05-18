import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { StripeController } from './stripe.controller'
import { StripeService } from './stripe.service'
import { Order, OrderSchema } from '../orders/schemas/order.schema'
import { Product, ProductSchema } from '../products/schemas/product.schema'

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}

// ─── app.module.ts ─────────────────────────────────────────────────
// Replace your existing app.module.ts with this file.
// Changes: Added StripeModule import.

import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module'
import { ProductsModule } from './products/products.module'
import { CategoriesModule } from './categories/categories.module'
import { OrdersModule } from './orders/orders.module'
import { StripeModule } from './stripe/stripe.module'   // ← NEW

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        uri: cs.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    StripeModule,   // ← NEW
  ],
})
export class AppModule {}

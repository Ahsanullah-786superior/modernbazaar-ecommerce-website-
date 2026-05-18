// ─── stripe/stripe.controller.ts ──────────────────────────────────
import {
  Controller, Post, Body, Headers, RawBodyRequest,
  Req, UseGuards, Request, HttpCode,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { StripeService } from './stripe.service'
import { JwtAuthGuard, RolesGuard } from '../auth/guards/jwt-auth.guard'
import { Public } from '../products/products.controller'
import { IsArray, IsString, IsOptional, ValidateNested, IsNumber, Min, IsObject } from 'class-validator'
import { Type } from 'class-transformer'

// ── DTOs ───────────────────────────────────────────────────────────
class CartItemDto {
  @IsString() productId: string
  @IsNumber() @Min(1) quantity: number
}

class ShippingAddressDto {
  @IsString() name: string
  @IsString() address: string
  @IsString() city: string
  @IsString() state: string
  @IsString() zipCode: string
  @IsString() country: string
}

class CreatePaymentIntentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[]

  @IsOptional() @IsString() currency?: string
}

class ConfirmOrderDto {
  @IsString() paymentIntentId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[]

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto
}

// ── Controller ─────────────────────────────────────────────────────
@ApiTags('stripe')
@Controller('stripe')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StripeController {
  constructor(private stripeService: StripeService) {}

  /**
   * Step 1: Frontend calls this to get a clientSecret for Stripe Elements.
   * Auth required so we can attach userId later.
   */
  @Post('create-payment-intent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe PaymentIntent and get clientSecret' })
  createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(dto)
  }

  /**
   * Step 2: After Stripe Elements confirms payment on the frontend,
   * call this to persist the order in DB.
   */
  @Post('confirm-order')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment and create order in DB' })
  confirmOrder(@Body() dto: ConfirmOrderDto, @Request() req: any) {
    return this.stripeService.confirmAndCreateOrder({
      ...dto,
      userId: req.user._id,
    })
  }

  /**
   * Stripe webhook - must be PUBLIC (no JWT), raw body needed.
   * Register in Stripe Dashboard: POST /api/stripe/webhook
   */
  @Post('webhook')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe webhook endpoint (register in Stripe Dashboard)' })
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody as unknown as Buffer
    return this.stripeService.handleWebhook(payload, signature)
  }
}

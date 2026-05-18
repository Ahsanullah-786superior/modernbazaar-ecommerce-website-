import {
  Controller, Get, Post, Patch, Body, Param,
  Query, UseGuards, Request,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto'
import { JwtAuthGuard, RolesGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../products/products.controller'

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(dto, req.user._id)
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user orders' })
  findMyOrders(@Request() req: any) {
    return this.ordersService.findMyOrders(req.user._id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by ID' })
  findById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.role === 'admin' ? undefined : req.user._id
    return this.ordersService.findById(id, userId)
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Get all orders' })
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.findAll({ status, page, limit })
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Update order status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto)
  }
}

 import { NestFactory } from '@nestjs/core'
import { ValidationPipe, INestApplication } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { json, urlencoded } from 'express'
import { AppModule } from './app.module'
import { User, UserDocument } from './auth/schemas/user.schema'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true })  // ← rawBody added

  // Increase payload limits for base64 images
  app.use(json({ limit: '50mb' }))
  app.use(urlencoded({ extended: true, limit: '50mb' }))

  // ─── Global prefix ─────────────────────────────────────────────
  app.setGlobalPrefix('api')

  // ─── CORS ──────────────────────────────────────────────────────
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const corsOrigins = [frontendUrl, 'http://localhost:3002']

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('CORS policy: origin not allowed'))
      }
    },
    credentials: true,
  })

  // ─── Global validation pipe ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // ─── Swagger documentation ─────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Modern Bazaar API')
    .setDescription('REST API for the Modern Bazaar e-commerce platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('products', 'Product management')
    .addTag('categories', 'Category management')
    .addTag('orders', 'Order management')
    .addTag('stripe', 'Stripe payment endpoints')  // ← stripe tag added
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  })

  if (process.env.NODE_ENV !== 'production') {
    await seedAdminUser(app)
  }

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 Modern Bazaar API running on http://localhost:${port}/api`)
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`)
}

async function seedAdminUser(app: INestApplication) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@modernbazaar.test'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!'
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name))

  const existingAdmin = await userModel.findOne({ email: adminEmail })
  if (existingAdmin) return

  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  await userModel.create({
    name: 'Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
  })

  console.log(`✅ Created development admin user: ${adminEmail} / ${adminPassword}`)
}

bootstrap()
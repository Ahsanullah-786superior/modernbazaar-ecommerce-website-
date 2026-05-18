# 🛍️ Modern Bazaar — Full-Stack E-Commerce Platform

A modern, production-ready e-commerce platform built with **Next.js 14**, **NestJS**, **MongoDB**, **Framer Motion**, **Three.js**, and **Swiper.js**.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Animations | Framer Motion |
| 3D Graphics | React Three Fiber, Three.js |
| Carousel | Swiper.js |
| State | Zustand (cart + auth) |
| Forms | React Hook Form + Zod |
| Backend | NestJS (REST API) |
| Database | MongoDB + Mongoose |
| Auth | JWT + Passport.js |
| Docs | Swagger / OpenAPI |

---

## 🗂️ Project Structure

```
modern-bazaar/
├── frontend/                    # Next.js App
│   └── src/
│       ├── app/                 # App Router pages
│       │   ├── page.tsx         # Homepage
│       │   ├── products/        # Product listing + detail
│       │   ├── checkout/        # Checkout flow
│       │   ├── auth/            # Login + Register
│       │   └── admin/           # Admin panel
│       ├── components/
│       │   ├── layout/          # Navbar, Footer, ThemeProvider
│       │   ├── home/            # Hero, Categories, Trending
│       │   ├── product/         # ProductCard + Skeleton
│       │   ├── cart/            # CartDrawer
│       │   ├── auth/            # AuthPage
│       │   ├── admin/           # Admin panel components
│       │   └── 3d/              # ThreeDSection (React Three Fiber)
│       ├── lib/
│       │   ├── api.ts           # Axios client + API functions
│       │   └── utils.ts         # Helpers (cn, formatPrice…)
│       ├── store/
│       │   └── index.ts         # Zustand stores (cart, auth, ui)
│       └── types/
│           └── index.ts         # TypeScript interfaces
│
└── backend/                     # NestJS API
    └── src/
        ├── main.ts              # Bootstrap + Swagger
        ├── app.module.ts        # Root module
        ├── auth/                # JWT auth (register/login/profile)
        │   ├── dto/             # RegisterDto, LoginDto
        │   ├── guards/          # JwtAuthGuard, RolesGuard
        │   ├── schemas/         # User schema
        │   └── strategies/      # JwtStrategy
        ├── products/            # Product CRUD + filters
        │   ├── dto/             # CreateProductDto, QueryDto
        │   └── schemas/         # Product schema (text index)
        ├── categories/          # Category CRUD
        │   ├── dto/
        │   └── schemas/
        ├── orders/              # Order management
        │   ├── dto/
        │   └── schemas/
        ├── common/
        │   └── filters/         # GlobalExceptionFilter
        └── seed.ts              # Database seeder
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/your-org/modern-bazaar.git
cd modern-bazaar

# Install frontend deps
cd frontend && npm install

# Install backend deps
cd ../backend && npm install
```

---

### 2. Configure Environment

**Backend** — copy and edit `.env.example`:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/modern-bazaar
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**Frontend** — copy and edit `.env.local.example`:
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

### 3. Seed the Database

```bash
cd backend
npx ts-node src/seed.ts
```

This creates:
- ✅ **5 categories**: Kitchen, Food, Toys, Watches, Earbuds
- ✅ **25 products** with realistic data, images, ratings
- ✅ **Admin user**: `admin@modernbazaar.com` / `admin123`

---

### 4. Run the Application

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run start:dev
# → API running at http://localhost:3001/api
# → Swagger docs at http://localhost:3001/api/docs
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → App running at http://localhost:3000
```

---

## 🔑 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/profile` | JWT | Get current user |
| POST | `/auth/logout` | JWT | Logout |

### Products — `/api/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List with filters, pagination, sort |
| GET | `/products/featured` | Public | Featured products |
| GET | `/products/trending` | Public | Trending (most reviewed) |
| GET | `/products/:id` | Public | Get by ID |
| GET | `/products/slug/:slug` | Public | Get by slug |
| GET | `/products/:id/related` | Public | Related products |
| POST | `/products` | Admin | Create product |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

### Categories — `/api/categories`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories` | Public | All categories |
| GET | `/categories/:id` | Public | Get by ID |
| POST | `/categories` | Admin | Create category |
| PATCH | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

### Orders — `/api/orders`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | JWT | Place an order |
| GET | `/orders/my` | JWT | My orders |
| GET | `/orders/:id` | JWT | Order detail |
| GET | `/orders` | Admin | All orders |
| PATCH | `/orders/:id/status` | Admin | Update status |

---

## 🎨 Pages & Features

| Page | Route | Features |
|---|---|---|
| Homepage | `/` | Hero (Framer Motion), Categories, Trending (Swiper), 3D section (Three.js), Trust badges |
| Product Listing | `/products` | Grid, filters (category/price/rating), sort, search, pagination, skeletons |
| Product Detail | `/products/[slug]` | Swiper gallery + thumbs, specs, reviews, add to cart |
| Cart | Drawer | Animated drawer, qty controls, price summary, free shipping indicator |
| Checkout | `/checkout` | 3-step (shipping → payment → review), order confirmation |
| Login | `/auth/login` | JWT auth, form validation, animated split layout |
| Register | `/auth/register` | Same as login, creates account |
| Admin Panel | `/admin` | Dashboard stats, product CRUD table, order management |

---

## 🌙 Dark Mode

Click the moon/sun icon in the navbar. Dark mode is fully supported via `next-themes` and Tailwind CSS variables. Preference is persisted in `localStorage`.

---

## 🛒 Cart State

The cart is managed by **Zustand** and **persisted to localStorage**. It survives page refreshes. The cart drawer opens from any page via the bag icon in the navbar.

---

## 🔐 Authentication

- JWT tokens are stored in both **Zustand** and **js-cookie** (for SSR-compatible auth header injection)
- Protected routes can use the `JwtAuthGuard` on the backend
- Admin routes additionally require the `RolesGuard` with `@Roles('admin')`
- On the frontend, use `useAuthStore()` to check `isAuthenticated` and redirect if needed

---

## 📸 Adding Real Product Images

The seeder uses Unsplash URLs. For production, integrate an image upload solution:

1. Add `multer` middleware to product create/update endpoints (already a dependency)
2. Upload to **AWS S3**, **Cloudinary**, or **Supabase Storage**
3. Return the CDN URL and store it in the `images` array

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
vercel deploy
```
Set env var: `NEXT_PUBLIC_API_URL=https://your-api-domain.com/api`

### Backend → Railway / Render / Fly.io
```bash
cd backend
npm run build
# Deploy dist/ folder, set env vars from .env
```

### MongoDB → MongoDB Atlas
Replace `MONGODB_URI` with your Atlas connection string.

---

## 🧪 Running Tests

```bash
# Backend unit tests
cd backend && npm test

# Backend e2e tests
cd backend && npm run test:e2e
```

---

## 📚 Swagger API Docs

Once the backend is running, visit:
```
http://localhost:3001/api/docs
```

Click **Authorize** and paste your JWT token to test protected endpoints.

---

## 💡 Key Design Decisions

- **App Router** (Next.js 14) for layouts, metadata, and streaming
- **Zustand** over Redux for simpler, boilerplate-free state
- **Zod + React Hook Form** for type-safe, performant form validation
- **Framer Motion** `whileInView` for scroll-triggered animations
- **Three.js via React Three Fiber** for the interactive 3D hero section
- **Swiper.js** for production-grade touch carousels with lazy loading
- **`class-variance-authority` + `tailwind-merge`** for variant-safe component styling
- NestJS **modules pattern** keeps each feature fully self-contained
- MongoDB **text indexes** on products for full-text search

---

## 📄 License

MIT — free for personal and commercial use.
#   m o d e r n b a z a a r - e c o m m e r c e - w e b s i t e -  
 
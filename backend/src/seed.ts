/**
 * Database Seed Script
 * Run with: npx ts-node src/seed.ts
 *
 * Seeds the database with:
 * - 5 categories (Kitchen, Food, Toys, Watches, Earbuds)
 * - 30 sample products
 * - 1 admin user
 */

import mongoose from 'mongoose'
import * as bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/modern-bazaar'

// ─── Inline schemas for seeding ────────────────────────────────────
const UserSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String }, { timestamps: true })
const CategorySchema = new mongoose.Schema({ name: String, slug: String, description: String, image: String }, { timestamps: true })
const ProductSchema = new mongoose.Schema({
  name: String, slug: String, description: String, price: Number, compareAtPrice: Number,
  images: [String], category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [String], rating: Number, reviewCount: Number, stock: Number, featured: Boolean,
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)
const Category = mongoose.model('Category', CategorySchema)
const Product = mongoose.model('Product', ProductSchema)

const CATEGORIES = [
  { name: 'Kitchen Appliances', slug: 'kitchen', description: 'Premium kitchen gadgets and appliances', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
  { name: 'Food Products', slug: 'food', description: 'Organic and gourmet food products', image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400' },
  { name: 'Kids Toys', slug: 'toys', description: 'Educational and fun toys for kids', image: 'https://images.unsplash.com/photo-1558060370-d644485927b4?w=400' },
  { name: 'Watches', slug: 'watches', description: 'Luxury and smart watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
  { name: 'Earbuds', slug: 'earbuds', description: 'Wireless and premium audio gear', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' },
]

const makeProducts = (catMap: Record<string, string>) => [
  // Kitchen
  { name: 'Air Fryer Pro 5L', slug: 'air-fryer-pro-5l', description: 'Digital touchscreen, 10 cooking presets, rapid air circulation for crispy results with 75% less oil.', price: 149, compareAtPrice: 199, images: ['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600'], category: catMap.kitchen, tags: ['air-fryer', 'healthy', 'digital'], rating: 4.7, reviewCount: 2100, stock: 60, featured: true },
  { name: 'Smart Coffee Maker 12-Cup', slug: 'smart-coffee-maker-12cup', description: 'WiFi-enabled coffee maker with programmable scheduling and temperature control.', price: 199, compareAtPrice: 249, images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'], category: catMap.kitchen, tags: ['coffee', 'smart', 'programmable'], rating: 4.6, reviewCount: 876, stock: 30, featured: true },
  { name: 'Professional Blender Pro', slug: 'professional-blender-pro', description: '1800W motor, 10 speed settings, self-cleaning function, includes tamper tool.', price: 129, compareAtPrice: 159, images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600'], category: catMap.kitchen, tags: ['blender', 'professional', 'smoothie'], rating: 4.5, reviewCount: 543, stock: 40, featured: false },
  { name: 'Instant Pot Duo 7-in-1', slug: 'instant-pot-duo-7in1', description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer in one.', price: 89, compareAtPrice: 119, images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'], category: catMap.kitchen, tags: ['pressure-cooker', 'instant-pot', 'multi-cooker'], rating: 4.8, reviewCount: 3421, stock: 80, featured: true },
  { name: 'Sous Vide Precision Cooker', slug: 'sous-vide-precision-cooker', description: 'WiFi-connected, 1200W, app-controlled for perfect precision cooking every time.', price: 179, compareAtPrice: 229, images: ['https://images.unsplash.com/photo-1547592180-85f173990554?w=600'], category: catMap.kitchen, tags: ['sous-vide', 'precision', 'professional'], rating: 4.6, reviewCount: 412, stock: 25, featured: false },
  // Food
  { name: 'Organic Raw Honey 1kg', slug: 'organic-raw-honey-1kg', description: 'Unprocessed, unfiltered raw honey from wildflower meadows. Rich in antioxidants.', price: 24, compareAtPrice: 32, images: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600'], category: catMap.food, tags: ['organic', 'honey', 'natural'], rating: 4.8, reviewCount: 1234, stock: 150, featured: true },
  { name: 'Premium Granola Mix 800g', slug: 'premium-granola-mix', description: 'Artisan blend of oats, nuts, seeds, and dried fruits. No artificial additives.', price: 18, compareAtPrice: 24, images: ['https://images.unsplash.com/photo-1517093702195-8080940a9501?w=600'], category: catMap.food, tags: ['granola', 'breakfast', 'organic'], rating: 4.5, reviewCount: 654, stock: 200, featured: false },
  { name: 'Cold Pressed Olive Oil 1L', slug: 'cold-pressed-olive-oil-1l', description: 'Extra virgin, single origin, first cold pressed from Greek Kalamata olives.', price: 29, compareAtPrice: 38, images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'], category: catMap.food, tags: ['olive-oil', 'organic', 'mediterranean'], rating: 4.7, reviewCount: 389, stock: 120, featured: false },
  { name: 'Matcha Ceremonial Grade 100g', slug: 'matcha-ceremonial-grade', description: 'First harvest, stone-ground ceremonial grade matcha from Uji, Japan.', price: 42, compareAtPrice: 55, images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600'], category: catMap.food, tags: ['matcha', 'japanese', 'organic'], rating: 4.9, reviewCount: 821, stock: 90, featured: true },
  { name: 'Artisan Dark Chocolate Set', slug: 'artisan-dark-chocolate-set', description: '6-bar set of single-origin 70-90% dark chocolates from around the world.', price: 35, compareAtPrice: 45, images: ['https://images.unsplash.com/photo-1511381939415-e44015466834?w=600'], category: catMap.food, tags: ['chocolate', 'artisan', 'gift'], rating: 4.6, reviewCount: 543, stock: 75, featured: false },
  // Toys
  { name: 'LEGO Creator Expert Set', slug: 'lego-creator-expert', description: '2,500 pieces, 3-in-1 build options. Perfect for ages 12+. Includes detailed instruction booklet.', price: 149, compareAtPrice: 179, images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600'], category: catMap.toys, tags: ['lego', 'creative', 'building'], rating: 4.9, reviewCount: 2341, stock: 50, featured: true },
  { name: 'Educational Robot Kit STEM', slug: 'educational-robot-kit-stem', description: 'Build and program your own robot. Teaches coding, engineering, and problem-solving.', price: 89, compareAtPrice: 119, images: ['https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600'], category: catMap.toys, tags: ['stem', 'robot', 'educational', 'coding'], rating: 4.7, reviewCount: 876, stock: 40, featured: true },
  { name: 'Magnetic Building Tiles 60pcs', slug: 'magnetic-building-tiles-60pcs', description: 'Premium magnetic tiles for open-ended creative building. STEM certified, ages 3+.', price: 59, compareAtPrice: 79, images: ['https://images.unsplash.com/photo-1558060370-d644485927b4?w=600'], category: catMap.toys, tags: ['magnetic', 'building', 'stem', 'creative'], rating: 4.8, reviewCount: 1543, stock: 100, featured: false },
  { name: 'Kids Telescope Beginner', slug: 'kids-telescope-beginner', description: '70mm aperture refractor telescope. Perfect for stargazing, bird watching, and exploring nature.', price: 69, compareAtPrice: 89, images: ['https://images.unsplash.com/photo-1545156521-77bd85671d30?w=600'], category: catMap.toys, tags: ['telescope', 'astronomy', 'educational'], rating: 4.4, reviewCount: 321, stock: 35, featured: false },
  { name: 'Wooden Puzzle Cube Set 5pcs', slug: 'wooden-puzzle-cube-set', description: 'Handcrafted sustainable wood puzzles. Develops spatial reasoning and fine motor skills.', price: 34, compareAtPrice: 44, images: ['https://images.unsplash.com/photo-1587654780291-d06b7bbaccb7?w=600'], category: catMap.toys, tags: ['wooden', 'puzzle', 'sustainable'], rating: 4.6, reviewCount: 445, stock: 90, featured: false },
  // Watches
  { name: 'Luxury Chronograph Auto', slug: 'luxury-chronograph-auto', description: 'Swiss-made automatic movement, sapphire crystal, 100m water resistance. Exhibition caseback.', price: 899, compareAtPrice: 1199, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'], category: catMap.watches, tags: ['swiss', 'automatic', 'luxury', 'chronograph'], rating: 4.9, reviewCount: 412, stock: 15, featured: true },
  { name: 'Smartwatch Pro Ultra', slug: 'smartwatch-pro-ultra', description: 'Always-on AMOLED display, ECG sensor, GPS, 7-day battery, 50m water resistance.', price: 449, compareAtPrice: 549, images: ['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600'], category: catMap.watches, tags: ['smartwatch', 'fitness', 'amoled', 'gps'], rating: 4.7, reviewCount: 1823, stock: 40, featured: true },
  { name: 'Field Watch Mechanical', slug: 'field-watch-mechanical', description: 'Hand-wound mechanical movement, leather strap, lume hands and markers, 50m WR.', price: 299, compareAtPrice: 379, images: ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600'], category: catMap.watches, tags: ['mechanical', 'field', 'vintage', 'leather'], rating: 4.6, reviewCount: 234, stock: 20, featured: false },
  { name: 'Minimalist Quartz Watch', slug: 'minimalist-quartz-watch', description: 'Ultra-thin 6mm case, Japanese quartz movement, mesh bracelet, 3ATM water resistant.', price: 149, compareAtPrice: 189, images: ['https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600'], category: catMap.watches, tags: ['minimalist', 'quartz', 'thin', 'mesh'], rating: 4.5, reviewCount: 567, stock: 55, featured: false },
  { name: 'Diver Watch 300m', slug: 'diver-watch-300m', description: 'Automatic movement, unidirectional bezel, 300m water resistance, helium escape valve.', price: 649, compareAtPrice: 799, images: ['https://images.unsplash.com/photo-1589810635657-232948472d98?w=600'], category: catMap.watches, tags: ['dive', 'automatic', 'professional', 'sport'], rating: 4.8, reviewCount: 312, stock: 12, featured: false },
  // Earbuds
  { name: 'ANC Pro Earbuds Elite', slug: 'anc-pro-earbuds-elite', description: 'Hybrid ANC technology, 30h total playtime, wireless charging, IPX5 water resistant.', price: 249, compareAtPrice: 319, images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600'], category: catMap.earbuds, tags: ['anc', 'wireless', 'premium', 'earbuds'], rating: 4.8, reviewCount: 2341, stock: 60, featured: true },
  { name: 'Over-Ear Studio Headphones', slug: 'over-ear-studio-headphones', description: 'Professional 40mm drivers, foldable design, 25h battery, hybrid ANC, Hi-Res Audio.', price: 349, compareAtPrice: 449, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'], category: catMap.earbuds, tags: ['over-ear', 'studio', 'hi-res', 'premium'], rating: 4.7, reviewCount: 1234, stock: 35, featured: true },
  { name: 'Sport Earbuds Pro', slug: 'sport-earbuds-pro', description: 'Secure ear-hook design, IPX7 waterproof, 12h battery, heart rate monitor, GPS.', price: 129, compareAtPrice: 169, images: ['https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600'], category: catMap.earbuds, tags: ['sport', 'waterproof', 'fitness', 'heart-rate'], rating: 4.5, reviewCount: 876, stock: 80, featured: false },
  { name: 'Open-Ear Bone Conduction', slug: 'open-ear-bone-conduction', description: 'Bone conduction technology, perfect for outdoor sports, IP67, 8h battery.', price: 99, compareAtPrice: 129, images: ['https://images.unsplash.com/photo-1621176997490-c70cd1f46c5e?w=600'], category: catMap.earbuds, tags: ['bone-conduction', 'open-ear', 'sport', 'outdoor'], rating: 4.3, reviewCount: 432, stock: 45, featured: false },
  { name: 'Kids Safe Volume Earbuds', slug: 'kids-safe-volume-earbuds', description: '85dB volume limiting, colorful design, 20h battery, foldable, includes 3 ear tip sizes.', price: 49, compareAtPrice: 65, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], category: catMap.earbuds, tags: ['kids', 'safe', 'volume-limiting', 'colorful'], rating: 4.6, reviewCount: 654, stock: 120, featured: false },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
  ])
  console.log('🗑️  Cleared existing data')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await User.create({
    name: 'Admin User',
    email: 'admin@modernbazaar.com',
    password: hashedPassword,
    role: 'admin',
  })
  console.log('👤 Created admin user: admin@modernbazaar.com / admin123')

  // Create categories
  const categories = await Category.insertMany(CATEGORIES)
  const catMap: Record<string, string> = {}
  categories.forEach((c) => { catMap[(c as any).slug] = (c as any)._id.toString() })
  console.log('📦 Created 5 categories')

  // Create products
  const products = makeProducts(catMap)
  await Product.insertMany(products)
  console.log(`🛍️  Created ${products.length} products`)

  console.log('\n🎉 Database seeded successfully!')
  console.log('📚 Swagger docs: http://localhost:3001/api/docs')
  console.log('🔑 Admin login: admin@modernbazaar.com / admin123')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})

import { Suspense } from 'react'
import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import HeroSection from '@/components/home/HeroSection'
import PromobannerSection from '@/components/home/PromobannerSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import TrendingProducts from '@/components/home/TrendingProducts'
import ThreeDSection from '@/components/3d/ThreeDSection'

export const metadata: Metadata = {
  title: 'Modern Bazaar — Curated Commerce',
  description: 'Discover premium kitchen appliances, food products, kids toys, watches, and earbuds.',
}



function TrustBadges() {
  const badges = [
    { emoji: '🚚', title: 'Free Shipping', desc: 'On orders over $100' },
    { emoji: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
    { emoji: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
    { emoji: '⭐', title: 'Top Rated', desc: '4.9/5 from 50K+ customers' },
  ]
  return (
    <section className="py-10 border-y border-border bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map(({ emoji, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="text-3xl">{emoji}</span>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      
      <Navbar />
      <main>
        <HeroSection />
        <PromobannerSection />
        <TrustBadges />
        <CategoriesSection />
        <TrendingProducts />
        <ThreeDSection />
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

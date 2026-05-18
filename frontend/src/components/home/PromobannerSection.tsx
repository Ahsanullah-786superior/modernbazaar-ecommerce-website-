'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function PromoBannerSection() {
  return (
    <section className="py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-shadow"
        >
          <Link href="/products">
            <Image
              src="/banners/banner1.jpeg"
              alt="Promotional Banner"
              width={1920}
              height={600}
              priority
              className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

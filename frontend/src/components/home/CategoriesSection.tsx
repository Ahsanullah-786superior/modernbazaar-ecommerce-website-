'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Loader2, Tag } from 'lucide-react'
import { categoriesApi } from '@/lib/api'
import { Category } from '@/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getAll()
        setCategories(res.data)
      } catch (error) {
        console.error('Failed to load categories', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">
              Explore
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Category grid */}
        {isLoading ? (
           <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {categories.map((category) => (
              <motion.div key={category._id} variants={itemVariants} className="h-full">
                <Link
                  href={category.slug === 'food' ? '/recipes' : `/products?category=${category.slug}`}
                  className="block group h-full"
                >
                  <div
                    className="bg-muted/30 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center h-full"
                  >
                    {/* Image */}
                    <motion.div
                      className="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-full overflow-hidden bg-background flex items-center justify-center shadow-sm"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <Tag className="w-8 h-8 text-muted-foreground" />
                      )}
                    </motion.div>

                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{category.productCount || 0} products</p>

                    {/* Arrow on hover */}
                    <div className="mt-auto pt-3 overflow-hidden h-5">
                      <motion.div
                        initial={{ y: 20 }}
                        whileHover={{ y: 0 }}
                        className="flex justify-center"
                      >
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

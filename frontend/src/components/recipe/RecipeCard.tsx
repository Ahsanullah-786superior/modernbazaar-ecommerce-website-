'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export interface Recipe {
  id: number
  name: string
  ingredients: string[]
  instructions: string[]
  prepTimeMinutes: number
  cookTimeMinutes: number
  servings: number
  difficulty: string
  cuisine: string
  caloriesPerServing: number
  tags: string[]
  userId: number
  image: string
  rating: number
  reviewCount: number
  mealType: string[]
}

interface RecipeCardProps {
  recipe: Recipe
  index?: number
}

export default function RecipeCard({ recipe, index = 0 }: RecipeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border group flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={recipe.image}
          alt={recipe.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-black px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
          ⭐ {recipe.rating}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow items-center text-center">
        <h3 className="font-display font-bold text-lg text-foreground mb-4 line-clamp-2">
          {recipe.name}
        </h3>
        
        <div className="mt-auto w-full">
          <Link
            href={`/recipes/${recipe.id}`}
            className="block w-full py-2.5 rounded-lg bg-bazaar-orange text-white font-medium hover:bg-bazaar-orange/90 transition-colors shadow-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

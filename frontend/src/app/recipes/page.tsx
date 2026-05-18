import { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RecipeCard, { Recipe } from '@/components/recipe/RecipeCard'

export const metadata: Metadata = {
  title: 'World Recipes | Modern Bazaar',
  description: 'Explore our curated collection of delicious recipes.',
}

async function getRecipes() {
  const res = await fetch('https://dummyjson.com/recipes?limit=30')
  if (!res.ok) {
    throw new Error('Failed to fetch recipes')
  }
  return res.json()
}

export default async function RecipesPage() {
  const data = await getRecipes()
  const recipes: Recipe[] = data.recipes

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <span className="text-4xl">🍽️</span> World Recipes
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover delicious recipes from around the globe. Whether you're craving Italian, Asian, or Mexican, we've got something for every taste bud.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}

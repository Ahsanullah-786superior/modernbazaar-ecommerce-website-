import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, Flame, ChefHat, Star } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Recipe } from '@/components/recipe/RecipeCard'

interface Props {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await getRecipe(params.id)
  return {
    title: `${recipe.name} | World Recipes`,
    description: `Learn how to make ${recipe.name}. ${recipe.cuisine} cuisine, ${recipe.difficulty} difficulty.`,
  }
}

async function getRecipe(id: string): Promise<Recipe> {
  const res = await fetch(`https://dummyjson.com/recipes/${id}`)
  if (!res.ok) {
    throw new Error('Failed to fetch recipe')
  }
  return res.json()
}

export default async function RecipeDetailPage({ params }: Props) {
  const recipe = await getRecipe(params.id)

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          
          <Link href="/recipes" className="inline-flex items-center text-muted-foreground hover:text-bazaar-orange transition-colors mb-6 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Recipes
          </Link>

          <div className="bg-card rounded-3xl overflow-hidden shadow-md border border-border">
            {/* Header Image */}
            <div className="relative h-64 sm:h-80 md:h-[400px] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={recipe.image} 
                alt={recipe.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 text-white">
                <div className="flex flex-wrap gap-2 mb-3">
                  {recipe.tags.map(tag => (
                    <span key={tag} className="bg-primary/90 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  {recipe.name}
                </h1>
                <div className="flex items-center gap-4 text-sm sm:text-base font-medium opacity-90">
                  <span className="flex items-center gap-1"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> {recipe.rating} ({recipe.reviewCount} reviews)</span>
                  <span>•</span>
                  <span>{recipe.cuisine}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 pb-8 border-b border-border">
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl">
                  <Clock className="w-6 h-6 text-bazaar-orange mb-2" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Prep Time</span>
                  <span className="font-bold text-lg">{recipe.prepTimeMinutes}m</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl">
                  <Flame className="w-6 h-6 text-bazaar-orange mb-2" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cook Time</span>
                  <span className="font-bold text-lg">{recipe.cookTimeMinutes}m</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl">
                  <Users className="w-6 h-6 text-bazaar-orange mb-2" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Servings</span>
                  <span className="font-bold text-lg">{recipe.servings}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl">
                  <ChefHat className="w-6 h-6 text-bazaar-orange mb-2" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Difficulty</span>
                  <span className="font-bold text-lg">{recipe.difficulty}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-10">
                {/* Ingredients */}
                <div className="md:col-span-1">
                  <h2 className="text-2xl font-display font-bold mb-5 flex items-center gap-2">
                    Ingredients
                  </h2>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-bazaar-orange/10 text-bazaar-orange flex items-center justify-center text-sm font-bold mt-0.5">
                          ✓
                        </span>
                        <span className="text-foreground/80">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-display font-bold mb-5">
                    Instructions
                  </h2>
                  <div className="space-y-6">
                    {recipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {i + 1}
                        </div>
                        <p className="text-foreground/80 pt-1 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

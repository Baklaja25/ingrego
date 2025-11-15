"use client"

import { RecipeCard } from "@/components/dashboard/recipe-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ChefHat } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Recipe {
  id: string
  title: string
  image?: string | null
  cookTimeMins: number
  servings: number
  summary?: string | null
}

interface RecipeGridProps {
  recipes: Recipe[]
  isLoading?: boolean
}

function RecipeSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function RecipeGrid({ recipes, isLoading }: RecipeGridProps) {
  if (isLoading) {
    return <RecipeSkeleton />
  }

  if (recipes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {"We couldn&apos;t find any recipes matching your ingredients. Try scanning different ingredients or adding more items."}
            </p>
            <Link href="/scan">
              <Button variant="outline">Try scanning again</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {recipes.map((recipe, index) => (
        <motion.div
          key={recipe.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <RecipeCard
            recipe={{
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              timeMins: recipe.cookTimeMins,
              servings: recipe.servings,
              description: recipe.summary || undefined,
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}



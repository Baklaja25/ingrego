"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { GeneratedRecipeCard } from "./generated-recipe-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { ChefHat, Clock, Users } from "lucide-react"
import { Recipe } from "@/lib/generateRecipes"

interface GeneratedRecipeGridProps {
  recipes: Recipe[]
  isLoading?: boolean
  onSaveRecipe?: (recipe: Recipe, index: number) => void | Promise<void>
  savingRecipeIndex?: number | null
}

function RecipeSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-full mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function GeneratedRecipeGrid({
  recipes,
  isLoading,
  onSaveRecipe,
  savingRecipeIndex = null,
}: GeneratedRecipeGridProps) {
  // Calculate common spices across all recipes
  const commonSpices = useMemo(() => {
    if (recipes.length === 0) return []

    const spiceCounts = new Map<string, number>()
    recipes.forEach((recipe) => {
      recipe.spices?.forEach((spice) => {
        const normalized = spice.toLowerCase().trim()
        spiceCounts.set(normalized, (spiceCounts.get(normalized) || 0) + 1)
      })
    })

    // Sort by frequency (descending)
    return Array.from(spiceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([spice]) => spice)
  }, [recipes])

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

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
              {"We couldn&apos;t generate any recipes with your ingredients. Try adding more ingredients or scanning again."}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {recipes.map((recipe, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GeneratedRecipeCard
              recipe={recipe}
              onSelect={() => setSelectedRecipe(recipe)}
              onSave={onSaveRecipe ? () => onSaveRecipe(recipe, index) : undefined}
              isSaving={savingRecipeIndex === index}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Common spices section */}
      {commonSpices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-6 border-t"
        >
          <h3 className="text-lg font-semibold mb-3">
            Common spices used across these recipes:
          </h3>
          <div className="flex flex-wrap gap-2">
            {commonSpices.map((spice, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-sm capitalize"
              >
                {spice}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>{selectedRecipe.title}</DialogTitle>
                <DialogDescription>{selectedRecipe.description}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 md:grid-cols-[1fr,1.5fr]">
                <div className="relative w-full overflow-hidden rounded-2xl bg-muted h-60 md:h-auto">
                  {selectedRecipe.imageUrl || selectedRecipe.thumbnailUrl ? (
                    <Image
                      src={selectedRecipe.imageUrl || selectedRecipe.thumbnailUrl!}
                      alt={selectedRecipe.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary/40">
                      <ChefHat className="h-16 w-16" />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{selectedRecipe.cookTimeMins} mins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{selectedRecipe.servings}</span>
                    </div>
                    {selectedRecipe.difficulty && (
                      <Badge variant="outline" className="capitalize">
                        {selectedRecipe.difficulty}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Ingredients
                    </h4>
                    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {selectedRecipe.ingredients.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>

                  {selectedRecipe.spices && selectedRecipe.spices.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Spices used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipe.spices.map((spice, idx) => (
                          <Badge key={idx} variant="secondary" className="capitalize">
                            {spice}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Steps
                </h4>
                <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {selectedRecipe.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}



"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, ChefHat, Loader2 } from "lucide-react"
import { Recipe } from "@/lib/generateRecipes"
import { cn } from "@/lib/utils"
import { AddToMealPlannerButton } from "@/components/AddToMealPlannerButton"
import { Button } from "@/components/ui/button"

interface GeneratedRecipeCardProps {
  recipe: Recipe
  onSelect?: () => void
  onSave?: () => void | Promise<void>
  isSaving?: boolean
}

export function GeneratedRecipeCard({ recipe, onSelect, onSave, isSaving }: GeneratedRecipeCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        "hover:shadow-lg transition-shadow h-full flex flex-col",
        onSelect && "cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      )}
      tabIndex={onSelect ? 0 : undefined}
      role={onSelect ? "button" : undefined}
      onKeyDown={(event) => {
        if (onSelect && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="relative w-full h-48 overflow-hidden rounded-t-2xl bg-muted">
        {recipe.imageUrl || recipe.thumbnailUrl ? (
          <Image
            src={recipe.imageUrl || recipe.thumbnailUrl!}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-primary/30" />
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {recipe.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.cookTimeMins} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
          {recipe.difficulty && (
            <Badge variant="outline" className="text-xs">
              {recipe.difficulty}
            </Badge>
          )}
        </div>

        {/* Spices used */}
        {recipe.spices && recipe.spices.length > 0 && (
          <div className="mt-auto pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Spices used:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recipe.spices.map((spice, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs capitalize"
                >
                  {spice}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {recipe.id ? (
            <div
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              <AddToMealPlannerButton recipeId={recipe.id} recipeTitle={recipe.title} />
              <div className="mt-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full border-[#FF8C42]/40 text-[#FF8C42]"
                >
                  <Link href={`/cook/${recipe.id}`}>Start cook mode</Link>
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={(event) => {
                event.stopPropagation()
                if (!isSaving) {
                  void onSave?.()
                }
              }}
              className="w-full rounded-full bg-[#FF8C42] text-white hover:bg-[#ff7b22]"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save this recipe"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


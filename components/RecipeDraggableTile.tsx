"use client"

import Image from "next/image"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export type MealPlannerRecipeSummary = {
  id: string
  title: string
  image?: string | null
  cookTimeMins?: number | null
  calories?: number | null
  tags?: string[]
  mealType?: string | null
}

interface RecipeDraggableTileProps {
  recipe: MealPlannerRecipeSummary
}

export function RecipeDraggableTile({ recipe }: RecipeDraggableTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `recipe-${recipe.id}`,
    data: { recipeId: recipe.id },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  const primaryTag = recipe.mealType || recipe.tags?.[0]

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        opacity: isDragging ? 0.65 : 1,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-grab active:cursor-grabbing rounded-2xl border border-[#FF8C42]/20 bg-white p-3 shadow-sm transition-all hover:border-[#FF8C42]/40 hover:shadow-md"
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#FBEED7] ring-1 ring-[#FF8C42]/20">
          {recipe.image ? (
            <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-[#1E1E1E] line-clamp-2">{recipe.title}</p>
          <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
            {primaryTag ? (
              <Badge variant="secondary" className="bg-[#FBEED7] text-[#FF8C42]">
                {primaryTag}
              </Badge>
            ) : null}
            {recipe.cookTimeMins ? (
              <Badge variant="outline" className="border-[#FF8C42]/30 text-muted-foreground">
                {recipe.cookTimeMins} mins
              </Badge>
            ) : null}
            {recipe.calories ? (
              <Badge variant="outline" className="border-[#FF8C42]/30 text-muted-foreground">
                {recipe.calories} kcal
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

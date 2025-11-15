"use client"

import Link from "next/link"
import { useMemo } from "react"
import Image from "next/image"
import { useDroppable } from "@dnd-kit/core"
import { AnimatePresence, motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MEAL_SLOTS,
  WEEK_DAYS,
} from "@/lib/mealPlan"
import { MealPlanData, MealSlot } from "@/src/types"
import { MealPlannerRecipeSummary } from "@/components/RecipeDraggableTile"
import {
  Sun,
  Cloud,
  CloudRain,
  Leaf,
  Flame,
  Waves,
  Moon,
  X,
  Plus,
} from "lucide-react"

const DAY_ICONS = [Sun, Cloud, CloudRain, Leaf, Flame, Waves, Moon]

interface MealPlannerGridProps {
  plan: MealPlanData
  recipesById: Record<string, MealPlannerRecipeSummary>
  onChange: (day: string, slot: MealSlot, recipeId: string | null) => void
}

export function MealPlannerGrid({ plan, recipesById, onChange }: MealPlannerGridProps) {
  const daySummaries = useMemo(() => {
    return WEEK_DAYS.map((day) => {
      const dayPlan = plan[day] ?? {}
      let calories = 0
      let cookTime = 0
      let filled = 0

      for (const slot of MEAL_SLOTS) {
        const recipeId = dayPlan[slot]
        if (recipeId) {
          const recipe = recipesById[recipeId]
          if (recipe) {
            if (typeof recipe.calories === "number") calories += recipe.calories
            if (typeof recipe.cookTimeMins === "number") cookTime += recipe.cookTimeMins
            filled += 1
          }
        }
      }

      return { day, calories, cookTime, filled }
    })
  }, [plan, recipesById])

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
        {WEEK_DAYS.map((day, index) => {
          const summary = daySummaries[index]
          const DayIcon = DAY_ICONS[index] ?? Sun
          return (
            <motion.div
              key={day}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
            >
              <Card className="overflow-hidden rounded-2xl border border-[#FF8C42]/20 bg-[#FBEED7]/50 shadow-sm transition hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF8C42]/15 text-[#FF8C42]">
                        <DayIcon className="h-4 w-4" />
                      </span>
                      <CardTitle className="text-base font-semibold capitalize text-[#1E1E1E]">
                        {day}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="border-[#FF8C42]/40 text-xs text-[#FF8C42]">
                      {summary.filled} / {MEAL_SLOTS.length}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {summary.calories || summary.cookTime
                      ? `${summary.calories || 0} kcal • ${summary.cookTime || 0} mins`
                      : "No meals scheduled"}
                  </p>
                </CardHeader>

                <CardContent className="space-y-3">
                  {MEAL_SLOTS.map((slot) => (
                    <MealPlannerCell
                      key={`${day}-${slot}`}
                      day={day}
                      slot={slot}
                      recipeId={plan[day]?.[slot] ?? null}
                      recipe={plan[day]?.[slot] ? recipesById[plan[day][slot] as string] : undefined}
                      onClear={() => onChange(day, slot, null)}
                    />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

interface MealPlannerCellProps {
  day: string
  slot: MealSlot
  recipeId: string | null
  recipe?: MealPlannerRecipeSummary
  onClear: () => void
}

function MealPlannerCell({ day, slot, recipeId, recipe, onClear }: MealPlannerCellProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${day}-${slot}`,
    data: { day, slot },
  })

  return (
    <div
      ref={setNodeRef}
      className={`group rounded-xl border border-dashed border-[#FF8C42]/40 bg-white/80 p-3 text-sm transition-all duration-200 hover:border-[#FF8C42] hover:bg-white ${
        isOver ? "border-[#FF8C42] bg-[#FF8C42]/10" : ""
      }`}
      title={recipeId ? "Click the × icon to remove or drag a new recipe to replace" : "Drag a recipe here or click to add later"}
    >
      <div className="mb-2 flex items-center justify-between">
        <Badge variant="secondary" className="capitalize bg-[#FBEED7] text-[#FF8C42]">
          {slot}
        </Badge>
        {recipeId ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <span className="rounded-full bg-[#FF8C42]/10 p-1 text-[#FF8C42] opacity-0 transition group-hover:opacity-100">
            <Plus className="h-3 w-3" />
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {recipe && recipeId ? (
          <motion.div
            key={recipeId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#FBEED7]">
                {recipe.image ? (
                  <Image src={recipe.image} alt={recipe.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-medium text-[#1E1E1E] line-clamp-2">{recipe.title}</p>
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  {recipe.cookTimeMins ? <span>{recipe.cookTimeMins} mins</span> : null}
                  {recipe.calories ? <span>{recipe.calories} kcal</span> : null}
                </div>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full rounded-full border-white/20 bg-white/10 text-white hover:bg-[#FF8C42]/20 hover:text-white sm:w-auto"
            >
              <Link href={`/cook/${recipe.id}`}>Cook mode</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Plus className="h-4 w-4 text-[#FF8C42]" />
            <span className="text-sm">Drag a recipe here</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


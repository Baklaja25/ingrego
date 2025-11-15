"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MEAL_SLOTS, WEEK_DAYS, createEmptyMealPlanData } from "@/lib/mealPlan"
import { MealPlanData, MealSlot } from "@/src/types"

interface AddToMealPlannerButtonProps {
  recipeId: string
  recipeTitle: string
  variant?: "default" | "outline"
}

type PlanResponse = {
  weekStart: string
  data: MealPlanData
}

export function AddToMealPlannerButton({
  recipeId,
  recipeTitle,
  variant = "outline",
}: AddToMealPlannerButtonProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [day, setDay] = useState<string>("monday")
  const [slot, setSlot] = useState<MealSlot>("dinner")

  useEffect(() => {
    if (!open) return

    const fetchPlan = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/mealplan", {
          method: "GET",
          cache: "no-store",
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to load meal plan")
        }

        const data = (await res.json()) as PlanResponse
        setPlan({
          weekStart: data.weekStart,
          data: data.data ?? createEmptyMealPlanData(),
        })
      } catch (error: any) {
        toast.error(error.message || "Unable to load meal plan")
        setPlan({
          weekStart: new Date().toISOString(),
          data: createEmptyMealPlanData(),
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlan()
  }, [open])

  const handleSubmit = async () => {
    if (!plan) return

    try {
      setIsSaving(true)

      const updatedData: MealPlanData = {
        ...plan.data,
        [day]: {
          ...(plan.data[day] ?? { breakfast: null, lunch: null, dinner: null }),
          [slot]: recipeId,
        },
      }

      const response = await fetch("/api/mealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart: plan.weekStart, data: updatedData }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update meal plan")
      }

      toast.success(`Added "${recipeTitle}" to your meal planner`)
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Unable to add recipe to meal planner")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={variant} size="sm">
            Add to meal planner
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to meal planner</DialogTitle>
            <DialogDescription>
              Choose a day and meal slot to schedule <span className="font-semibold">{recipeTitle}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="meal-day">Day of week</Label>
              <select
                id="meal-day"
                value={day}
                onChange={(event) => setDay(event.target.value)}
                className="rounded-md border bg-background px-3 py-2 text-sm"
                disabled={isLoading || isSaving}
              >
                {WEEK_DAYS.map((weekday) => (
                  <option key={weekday} value={weekday}>
                    {weekday.charAt(0).toUpperCase() + weekday.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meal-slot">Meal</Label>
              <select
                id="meal-slot"
                value={slot}
                onChange={(event) => setSlot(event.target.value as MealSlot)}
                className="rounded-md border bg-background px-3 py-2 text-sm capitalize"
                disabled={isLoading || isSaving}
              >
                {MEAL_SLOTS.map((mealSlot) => (
                  <option key={mealSlot} value={mealSlot}>
                    {mealSlot.charAt(0).toUpperCase() + mealSlot.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {plan?.data?.[day]?.[slot] ? (
              <p className="text-sm text-muted-foreground">
                This slot currently has a recipe scheduled. Saving will replace it.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || isSaving}>
              {isSaving ? "Saving…" : "Save to planner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


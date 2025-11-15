"use client"

import { useEffect, useMemo, useState } from "react"
import { addWeeks, format } from "date-fns"
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Loader2, CalendarDays, Search, Filter, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MealPlannerGrid } from "@/components/MealPlannerGrid"
import { RecipeDraggableTile, MealPlannerRecipeSummary } from "@/components/RecipeDraggableTile"
import { ShoppingListModal } from "@/components/ShoppingListModal"
import { useMealPlannerStore } from "@/stores/meal-planner-store"
import { MealPlanData, MealSlot } from "@/src/types"
import { createEmptyMealPlanData, MEAL_SLOTS, WEEK_DAYS } from "@/lib/mealPlan"
import Link from "next/link"

type ShoppingListItem = {
  name: string
  count: number
  category?: string
}

interface MealPlannerClientProps {
  initialWeekStart: string
  initialPlan: MealPlanData
  recipes: MealPlannerRecipeSummary[]
}

function getWeekRangeLabel(iso: string) {
  try {
    const start = new Date(iso)
    const end = addWeeks(start, 1)
    end.setDate(end.getDate() - 1)
    return `${format(start, "MMM d")} – ${format(end, "MMM d")}`
  } catch {
    return ""
  }
}

export function MealPlannerClient({ initialWeekStart, initialPlan, recipes }: MealPlannerClientProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const setWeekPlan = useMealPlannerStore((state) => state.setWeekPlan)
  const plan = useMealPlannerStore((state) => state.plan)
  const setSlot = useMealPlannerStore((state) => state.setSlot)
  const weekStart = useMealPlannerStore((state) => state.weekStart)

  const [activeWeekStart, setActiveWeekStart] = useState(initialWeekStart)
  const [isSaving, setIsSaving] = useState(false)
  const [isShoppingLoading, setIsShoppingLoading] = useState(false)
  const [shoppingModalOpen, setShoppingModalOpen] = useState(false)
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])
  const [isWeekLoading, setIsWeekLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    setWeekPlan(initialWeekStart, initialPlan)
    setActiveWeekStart(initialWeekStart)
  }, [initialWeekStart, initialPlan, setWeekPlan])

  const recipesById = useMemo(() => {
    const map: Record<string, MealPlannerRecipeSummary> = {}
    recipes.forEach((recipe) => {
      map[recipe.id] = recipe
    })
    return map
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return recipes
    return recipes.filter((recipe) => recipe.title.toLowerCase().includes(term))
  }, [recipes, search])

  const isPlanEmpty = useMemo(() => {
    return WEEK_DAYS.every((day) =>
      MEAL_SLOTS.every((slot) => !plan?.[day]?.[slot])
    )
  }, [plan])

  const summary = useMemo(() => {
    let totalMeals = 0
    let totalMinutes = 0

    WEEK_DAYS.forEach((day) => {
      MEAL_SLOTS.forEach((slot) => {
        const recipeId = plan?.[day]?.[slot]
        if (recipeId) {
          totalMeals += 1
          const recipe = recipesById[recipeId]
          if (recipe?.cookTimeMins) {
            totalMinutes += recipe.cookTimeMins
          }
        }
      })
    })

    return {
      totalMeals,
      totalMinutes,
    }
  }, [plan, recipesById])

  const handleDragEnd = (event: DragEndEvent) => {
    const recipeId = event.active?.data?.current?.recipeId as string | undefined
    const day = event.over?.data?.current?.day as string | undefined
    const slot = event.over?.data?.current?.slot as MealSlot | undefined

    if (recipeId && day && slot) {
      setSlot(day, slot, recipeId)
    }
  }

  const fetchWeekPlan = async (targetWeekISO: string) => {
    try {
      setIsWeekLoading(true)
      const params = new URLSearchParams({ weekStart: targetWeekISO })
      const response = await fetch(`/api/mealplan?${params.toString()}`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load meal plan")
      }

      const data = await response.json()
      const normalized: MealPlanData = data?.data ?? createEmptyMealPlanData()
      const normalizedWeek = data?.weekStart ?? targetWeekISO

      setWeekPlan(normalizedWeek, normalized)
      setActiveWeekStart(normalizedWeek)
    } catch (error: any) {
      toast.error(error.message || "Unable to load week")
    } finally {
      setIsWeekLoading(false)
    }
  }

  const handleNavigateWeek = (direction: "previous" | "next") => {
    const current = new Date(activeWeekStart)
    const offset = direction === "previous" ? -7 : 7
    const target = new Date(current)
    target.setDate(target.getDate() + offset)
    target.setHours(0, 0, 0, 0)
    fetchWeekPlan(target.toISOString())
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch("/api/mealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart, data: plan }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save meal plan")
      }

      toast.success("Meal plan saved")
    } catch (error: any) {
      toast.error(error.message || "Unable to save meal plan")
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateShoppingList = async () => {
    try {
      setIsShoppingLoading(true)
      setShoppingModalOpen(true)

      const params = new URLSearchParams({ weekStart })
      const response = await fetch(`/api/mealplan/shopping-list?${params.toString()}`)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate shopping list")
      }

      const data = await response.json()
      setShoppingList(data.shoppingList ?? [])
    } catch (error: any) {
      toast.error(error.message || "Unable to generate shopping list")
      setShoppingList([])
    } finally {
      setIsShoppingLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-[#FF8C42]/15 bg-white/90 p-6 shadow-lg backdrop-blur"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-sm font-medium text-[#FF8C42]">
                <CalendarDays className="h-4 w-4" />
                Week of {getWeekRangeLabel(activeWeekStart)}
              </p>
              <p className="text-xs text-muted-foreground">
                Drag recipes into breakfast, lunch, and dinner slots. Hover any slot for tips.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full border-[#FF8C42]/40 text-sm text-[#FF8C42]"
                onClick={() => handleNavigateWeek("previous")}
                disabled={isWeekLoading}
              >
                {isWeekLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Previous week"}
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-[#FF8C42]/40 text-sm text-[#FF8C42]"
                onClick={() => handleNavigateWeek("next")}
                disabled={isWeekLoading}
              >
                Next week
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FBEED7] px-3 py-1 text-[#FF8C42]">
                {summary.totalMeals} meals planned
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FBEED7] px-3 py-1 text-[#FF8C42]">
                ~{summary.totalMinutes} mins cooking
              </span>
            </div>
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-full border-[#FF8C42]/40 text-[#FF8C42]"
                onClick={() => setSidebarOpen(true)}
              >
                Browse recipes
              </Button>
            </div>
          </div>
        </motion.div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-6">
              {isPlanEmpty ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-[#FF8C42]/40 bg-[#FBEED7]/40 p-10 text-center shadow-sm"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF8C42]/10 text-[#FF8C42]">
                    <ChefHat className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-[#1E1E1E]">Plan your first meals</h3>
                    <p className="text-sm text-muted-foreground">
                      Scan your ingredients or add saved recipes to start building your week.
                    </p>
                  </div>
                  <Link
                    href="/scan"
                    className="rounded-full bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] px-6 py-2 text-sm font-medium text-white shadow transition hover:brightness-105"
                  >
                    Go to Scan page
                  </Link>
                </motion.div>
              ) : null}

              <MealPlannerGrid plan={plan} recipesById={recipesById} onChange={setSlot} />
            </section>

            <aside className="hidden h-fit rounded-3xl border border-[#FF8C42]/20 bg-[#FBEED7]/40 p-4 shadow-sm lg:sticky lg:top-28 lg:block">
              <SidebarContent
                search={search}
                setSearch={setSearch}
                recipes={filteredRecipes}
              />
            </aside>
          </div>
        </DndContext>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="w-full sm:max-w-sm" side="right">
          <SheetHeader>
            <SheetTitle>Browse recipes</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <SidebarContent search={search} setSearch={setSearch} recipes={filteredRecipes} />
          </div>
        </SheetContent>
      </Sheet>

      <ShoppingListModal
        open={shoppingModalOpen}
        onOpenChange={setShoppingModalOpen}
        weekStart={weekStart}
        items={shoppingList}
        isLoading={isShoppingLoading}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-[960px] rounded-full border border-[#FF8C42]/30 bg-white/90 px-4 py-3 shadow-xl shadow-[#FF8C42]/10 backdrop-blur-lg md:inset-x-auto md:left-1/2 md:w-[min(92%,960px)] md:-translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between md:gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FBEED7] px-3 py-1 text-[#FF8C42]">
              {summary.totalMeals} meals
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FBEED7] px-3 py-1 text-[#FF8C42]">
              ~{summary.totalMinutes} mins cook time
            </span>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end sm:gap-3">
            <Button
              variant="outline"
              className="rounded-full border-[#FF8C42]/40 text-[#FF8C42]"
              onClick={handleGenerateShoppingList}
              disabled={isShoppingLoading}
            >
              {isShoppingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate shopping list
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] text-white hover:brightness-105"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save meal plan
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

function SidebarContent({
  search,
  setSearch,
  recipes,
}: {
  search: string
  setSearch: (value: string) => void
  recipes: MealPlannerRecipeSummary[]
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search recipes"
          className="w-full rounded-full border-[#FF8C42]/30 pl-10"
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        Suggested filters: quick, vegetarian, high-protein
      </div>

      <div className="h-[520px] space-y-6 overflow-y-auto pr-1">
        <section>
          <h3 className="text-sm font-semibold text-[#FF8C42]">Your recent recipes</h3>
          <div className="mt-3 space-y-3">
            {recipes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No saved recipes yet. Scan or save recipes to use them here.
              </p>
            ) : (
              recipes.map((recipe) => <RecipeDraggableTile key={recipe.id} recipe={recipe} />)
            )}
          </div>
        </section>
      </div>
    </div>
  )
}


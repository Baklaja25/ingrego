import Link from "next/link"
import { redirect } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getWeekStart } from "@/lib/getWeekStart"
import { createEmptyMealPlanData, normalizeMealPlanData } from "@/lib/mealPlan"
import { MealPlannerClient } from "@/components/meal-planner/MealPlannerClient"
import type { MealPlannerRecipeSummary } from "@/components/RecipeDraggableTile"

export const dynamic = "force-dynamic"

export default async function MealPlannerPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/login?from=/meal-planner")
  }

  const weekStartDate = getWeekStart()

  const mealPlanRecord = await prisma.mealPlan.findUnique({
    where: {
      userId_weekStart: {
        userId: session.user.id,
        weekStart: weekStartDate,
      },
    },
  })

  const initialPlan = mealPlanRecord
    ? normalizeMealPlanData(JSON.parse(mealPlanRecord.data || "{}"))
    : createEmptyMealPlanData()

  const savedRecipes = await prisma.userRecipe.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
    take: 40,
    include: {
      recipe: {
        select: {
          id: true,
          title: true,
          image: true,
          timeMins: true,
          calories: true,
        },
      },
    },
  })

  const recipesMap = new Map<string, MealPlannerRecipeSummary>()

  savedRecipes.forEach((saved) => {
    if (saved.recipe) {
      recipesMap.set(saved.recipe.id, {
        id: saved.recipe.id,
        title: saved.recipe.title,
        image: saved.recipe.image,
        cookTimeMins: saved.recipe.timeMins,
        calories: saved.recipe.calories,
      })
    }
  })

  const planRecipeIds = new Set<string>()
  Object.values(initialPlan).forEach((day) => {
    Object.values(day).forEach((recipeId) => {
      if (recipeId) {
        planRecipeIds.add(recipeId)
      }
    })
  })

  const missingIds = Array.from(planRecipeIds).filter((recipeId) => !recipesMap.has(recipeId))
  if (missingIds.length > 0) {
    const additionalRecipes = await prisma.recipe.findMany({
      where: { id: { in: missingIds } },
      select: {
        id: true,
        title: true,
        image: true,
        timeMins: true,
        calories: true,
      },
    })

    additionalRecipes.forEach((recipe) => {
      recipesMap.set(recipe.id, {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        cookTimeMins: recipe.timeMins,
        calories: recipe.calories,
      })
    })
  }

  const recipes = Array.from(recipesMap.values())

  return (
    <div className="space-y-8">
      <header className="space-y-6 rounded-3xl border border-[#FF8C42]/20 bg-gradient-to-tr from-[#FBEED7] via-white to-white p-6 shadow-sm">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="transition hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-[#FF8C42]">Meal Planner</span>
        </nav>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E1E1E]">Your Weekly Meal Plan</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Organize breakfast, lunch, and dinner for the whole week, then generate a smart
            shopping list with one click.
          </p>
        </div>
      </header>

      <MealPlannerClient
        initialWeekStart={weekStartDate.toISOString()}
        initialPlan={initialPlan}
        recipes={recipes}
      />
    </div>
  )
}



import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardOverviewClient } from "./dashboard-overview-client"

export type DashboardOverviewData = {
  thisWeek: {
    totalMeals: number
    totalCalories: number
  }
  savedRecipes: {
    count: number
    items: Array<{
      id: string
      title: string
      imageUrl?: string | null
      timeMins?: number | null
      servings?: number | null
      createdAt: string
    }>
  }
  scans: {
    totalCount: number
    recent: Array<{
      id: string
      imageUrl?: string
      ingredients: string[]
      cacheKey: string
      createdAt: string
    }>
  }
  todaysTip: string
}

async function getOverviewData(): Promise<DashboardOverviewData | null> {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const userId = session.user.id

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)

  let mealPlan = null
  try {
    if (prisma.mealPlan) {
      mealPlan = await prisma.mealPlan.findFirst({
        where: {
          userId,
          weekStart,
        },
      })
    }
  } catch (error) {
    console.error("Error fetching meal plan:", error)
    mealPlan = null
  }

  let totalMeals = 0
  let totalCalories = 0

  if (mealPlan) {
    const entries = JSON.parse(mealPlan.data || "{}")
    const mealIds = new Set<string>()

    Object.values(entries).forEach((day: any) => {
      if (day) {
        Object.values(day).forEach((mealId: any) => {
          if (mealId) mealIds.add(mealId)
        })
      }
    })

    totalMeals = mealIds.size

    if (mealIds.size > 0 && prisma.recipe) {
      try {
        const recipes = await prisma.recipe.findMany({
          where: { id: { in: Array.from(mealIds) } },
          select: { calories: true },
        })

        totalCalories = recipes.reduce((sum, r) => sum + (r.calories || 0), 0)
      } catch (error) {
        console.error("Error fetching recipes:", error)
      }
    }
  }

  let savedRecipesCount = 0
  let savedRecipesItems: Array<{
    id: string
    title: string
    imageUrl?: string | null
    timeMins?: number | null
    servings?: number | null
    createdAt: string
  }> = []
  try {
    if (prisma.userRecipe) {
      const [count, savedList] = await Promise.all([
        prisma.userRecipe.count({
          where: { userId },
        }),
        prisma.userRecipe.findMany({
          where: { userId },
          orderBy: { savedAt: "desc" },
          take: 6,
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                image: true,
                timeMins: true,
                servings: true,
                createdAt: true,
              },
            },
          },
        }),
      ])

      savedRecipesCount = count
      savedRecipesItems = savedList
        .map((entry) => {
          const recipeId = entry.recipe?.id ?? entry.recipeId
          if (!recipeId) {
            return null
          }

          const createdAtSource = entry.recipe?.createdAt ?? entry.savedAt
          const createdAt =
            createdAtSource instanceof Date
              ? createdAtSource.toISOString()
              : new Date(createdAtSource).toISOString()

          return {
            id: recipeId,
            title: entry.recipe?.title ?? "Untitled recipe",
            imageUrl: entry.recipe?.image,
            timeMins: entry.recipe?.timeMins ?? undefined,
            servings: entry.recipe?.servings ?? undefined,
            createdAt,
          }
        })
        .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe))
    }
  } catch (error) {
    console.error("Error fetching saved recipes count:", error)
  }

  type RecentScanRecord = Array<{
    id: string
    imageUrl: string | null
    ingredientsJSON: string | null
    ingredientsCSV: string | null
    cacheKey: string
    createdAt: Date
  }>

  let recentScans: RecentScanRecord = []
  let totalScansCount = 0
  try {
    if (prisma.scan) {
      totalScansCount = await prisma.scan.count({
        where: { userId },
      })

      recentScans = await prisma.scan.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          imageUrl: true,
          ingredientsJSON: true,
          ingredientsCSV: true,
          cacheKey: true,
          createdAt: true,
        },
      })
    }
  } catch (error) {
    console.error("Error fetching scans:", error)
  }

  const tips = [
    "Roast veggies in batches on Sunday to mix and match all week.",
    "Keep herbs fresh by storing them in a glass of water in the fridge.",
    "Taste as you cook—layering salt and acid brings dishes to life.",
    "Toast your spices in a dry pan for 30 seconds to wake up their aroma.",
    "Reserve a little pasta water to emulsify sauces for extra silkiness.",
    "Label leftovers with dates so your meal planner stays accurate.",
  ]

  const todaysTip = tips[new Date().getDate() % tips.length]

  return {
    thisWeek: {
      totalMeals,
      totalCalories,
    },
    savedRecipes: {
      count: savedRecipesCount,
      items: savedRecipesItems,
    },
    todaysTip,
    scans: {
      totalCount: totalScansCount,
      recent: recentScans.map((scan) => {
        let ingredients: string[] = []
        if (scan.ingredientsJSON) {
          try {
            const parsed = JSON.parse(scan.ingredientsJSON)
            if (Array.isArray(parsed)) {
              ingredients = parsed.map((item) => String(item).trim()).filter(Boolean)
            }
          } catch (error) {
            console.error("Failed to parse ingredientsJSON, falling back to CSV", error)
          }
        }

        if (ingredients.length === 0) {
          ingredients = (scan.ingredientsCSV ?? "").split(",").map((item) => item.trim()).filter(Boolean)
        }

        return {
          id: scan.id,
          imageUrl: scan.imageUrl ?? undefined,
          ingredients,
          cacheKey: scan.cacheKey ?? "",
          createdAt: scan.createdAt.toISOString(),
        }
      }),
    },
  }
}

export async function DashboardOverview() {
  const data = await getOverviewData()

  if (!data) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>Unable to load dashboard data</p>
      </div>
    )
  }

  return <DashboardOverviewClient data={data} />
}


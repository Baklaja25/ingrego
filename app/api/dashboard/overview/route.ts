import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get meal plan for this week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
    weekStart.setHours(0, 0, 0, 0)

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        userId,
        weekStart,
      },
    })

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

      if (mealIds.size > 0) {
        const recipes = await prisma.recipe.findMany({
          where: { id: { in: Array.from(mealIds) } },
          select: { calories: true },
        })

        totalCalories = recipes.reduce((sum, r) => sum + (r.calories || 0), 0)
      }
    }

    // Get saved recipes count
    const savedRecipesCount = await prisma.userRecipe.count({
      where: { userId },
    })

    // Get recent scans (last 3)
    const recentScans = await prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        imageUrl: true,
        ingredientsJSON: true,
        ingredientsCSV: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      thisWeek: {
        totalMeals,
        totalCalories,
      },
      savedRecipes: {
        count: savedRecipesCount,
      },
      recentScans: recentScans.map((scan) => {
        let ingredients: string[] = []
        if (scan.ingredientsJSON) {
          try {
            const parsed = JSON.parse(scan.ingredientsJSON)
            if (Array.isArray(parsed)) {
              ingredients = parsed.map((item) => String(item).trim()).filter(Boolean)
            }
          } catch (error) {
            console.error("Failed to parse ingredientsJSON in overview route", error)
          }
        }
        if (ingredients.length === 0) {
          ingredients = scan.ingredientsCSV
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        }
        return {
          id: scan.id,
          imageUrl: scan.imageUrl ?? undefined,
          ingredients,
          createdAt: scan.createdAt,
        }
      }),
    })
  } catch (error) {
    console.error("Dashboard overview error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



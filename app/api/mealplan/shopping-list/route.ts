import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getWeekStart } from "@/lib/getWeekStart"
import { normalizeMealPlanData } from "@/lib/mealPlan"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const querySchema = z.object({
  weekStart: z.string().optional(),
})

function parseWeekStart(input?: string): Date {
  if (!input) {
    return getWeekStart()
  }

  const parsed = new Date(input)

  if (Number.isNaN(parsed.getTime())) {
    return getWeekStart()
  }

  return getWeekStart(parsed)
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const parsedQuery = querySchema.safeParse({
      weekStart: searchParams.get("weekStart") ?? undefined,
    })

    const weekStart = parseWeekStart(parsedQuery.success ? parsedQuery.data.weekStart : undefined)

    const mealPlanRecord = await prisma.mealPlan.findUnique({
      where: {
        userId_weekStart: {
          userId: session.user.id,
          weekStart,
        },
      },
    })

    if (!mealPlanRecord) {
      return NextResponse.json({
        weekStart: weekStart.toISOString(),
        shoppingList: [],
      })
    }

    const plan = normalizeMealPlanData(JSON.parse(mealPlanRecord.data || "{}"))

    const recipeIds = new Set<string>()
    for (const day of Object.values(plan)) {
      for (const mealId of Object.values(day)) {
        if (mealId) {
          recipeIds.add(mealId)
        }
      }
    }

    if (recipeIds.size === 0) {
      return NextResponse.json({
        weekStart: weekStart.toISOString(),
        shoppingList: [],
      })
    }

    const recipes = await prisma.recipe.findMany({
      where: { id: { in: Array.from(recipeIds) } },
      select: { id: true, ingredients: true },
    })

    const ingredientCounts = new Map<string, number>()

    for (const recipe of recipes) {
      if (!recipe.ingredients) continue
      try {
        const ingredientList = JSON.parse(recipe.ingredients) as string[]
        if (Array.isArray(ingredientList)) {
          for (const ingredient of ingredientList) {
            const normalized = String(ingredient).trim().toLowerCase()
            if (!normalized) continue
            ingredientCounts.set(normalized, (ingredientCounts.get(normalized) ?? 0) + 1)
          }
        }
      } catch (error) {
        console.error("Failed to parse recipe ingredients for shopping list", error, recipe.id)
      }
    }

    const shoppingList = Array.from(ingredientCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    return NextResponse.json({
      weekStart: weekStart.toISOString(),
      shoppingList,
    })
  } catch (error) {
    console.error("Shopping list generation error:", error)
    return NextResponse.json({ error: "Failed to generate shopping list" }, { status: 500 })
  }
}







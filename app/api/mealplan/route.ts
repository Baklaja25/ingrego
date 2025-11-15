import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getWeekStart } from "@/lib/getWeekStart"
import { createEmptyMealPlanData, normalizeMealPlanData } from "@/lib/mealPlan"
import { MealPlanData } from "@/src/types"

export const runtime = "nodejs"

const querySchema = z.object({
  weekStart: z.string().optional(),
})

const bodySchema = z.object({
  weekStart: z.string(),
  data: z.record(
    z.any()
  ),
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

    const planData: MealPlanData = mealPlanRecord
      ? normalizeMealPlanData(JSON.parse(mealPlanRecord.data || "{}"))
      : createEmptyMealPlanData()

    return NextResponse.json({
      weekStart: weekStart.toISOString(),
      data: planData,
    })
  } catch (error) {
    console.error("Meal plan fetch error:", error)
    return NextResponse.json({ error: "Failed to load meal plan" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsedBody = bodySchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedBody.error.flatten() },
        { status: 400 }
      )
    }

    const weekStart = parseWeekStart(parsedBody.data.weekStart)
    const normalizedData = normalizeMealPlanData(parsedBody.data.data)

    const stored = await prisma.mealPlan.upsert({
      where: {
        userId_weekStart: {
          userId: session.user.id,
          weekStart,
        },
      },
      update: {
        data: JSON.stringify(normalizedData),
      },
      create: {
        userId: session.user.id,
        weekStart,
        data: JSON.stringify(normalizedData),
      },
    })

    return NextResponse.json({
      weekStart: stored.weekStart.toISOString(),
      data: normalizedData,
    })
  } catch (error) {
    console.error("Meal plan save error:", error)
    return NextResponse.json({ error: "Failed to save meal plan" }, { status: 500 })
  }
}









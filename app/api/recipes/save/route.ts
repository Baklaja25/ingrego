import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const recipeSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    cookTimeMins: z.number().nonnegative(),
    servings: z.union([z.string(), z.number()]),
    difficulty: z.string().optional(),
    ingredients: z.array(z.string()).min(1),
    spices: z.array(z.string()).optional(),
    steps: z.array(z.string()).min(1),
    imageUrl: z.string().url().optional().or(z.literal("")),
    thumbnailUrl: z.string().url().optional().or(z.literal("")),
  })

function parseServings(value: string | number): { count: number; label: string } {
  if (typeof value === "number" && Number.isFinite(value)) {
    const count = Math.max(1, Math.round(value))
    return { count, label: `${count} servings` }
  }

  const text = String(value).trim()
  const match = text.match(/\d+/)
  const count = match ? Math.max(1, parseInt(match[0], 10)) : 1
  const label = match ? text : `${count} servings`
  return { count, label }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch (error) {
      console.error("Save recipe JSON parse error:", error)
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
    }

    const parsed = recipeSchema.safeParse(body)

    if (!parsed.success) {
      console.error("Save recipe validation failed:", parsed.error.flatten())
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      cookTimeMins,
      servings,
      difficulty,
      ingredients,
      spices = [],
      steps,
      imageUrl,
      thumbnailUrl,
    } = parsed.data

    const { count: servingsCount, label: servingsLabel } = parseServings(servings)
    const cookingTime = Math.max(1, Math.round(cookTimeMins))

    const tagsArray = [
      ...new Set([
        ...spices.filter((tag) => typeof tag === "string" && tag.trim().length > 0).map((tag) => tag.trim()),
        ...(difficulty ? [difficulty] : []),
      ]),
    ]

    const recipeRecord = await prisma.recipe.create({
      data: {
        title,
        description,
        image: imageUrl || thumbnailUrl,
        timeMins: cookingTime,
        servings: servingsCount,
        tags: JSON.stringify(tagsArray),
        ingredients: JSON.stringify(ingredients),
        instructions: JSON.stringify(steps),
      },
    })

    await prisma.userRecipe.create({
      data: {
        userId: session.user.id,
        recipeId: recipeRecord.id,
      },
    })

    return NextResponse.json({
      recipeId: recipeRecord.id,
      recipe: {
        id: recipeRecord.id,
        title: recipeRecord.title,
        image: recipeRecord.image,
        timeMins: recipeRecord.timeMins,
        servings: servingsLabel,
        tags: tagsArray,
      },
    })
  } catch (error: any) {
    console.error("Save recipe error:", error)

    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Recipe already saved." }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 })
  }
}



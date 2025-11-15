import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [savedRecipes, total] = await Promise.all([
      prisma.userRecipe.findMany({
        where: { userId },
        include: {
          recipe: true,
        },
        orderBy: { savedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.userRecipe.count({
        where: { userId },
      }),
    ])

    const recipes = savedRecipes.map((ur) => ({
      ...ur.recipe,
      tags: JSON.parse(ur.recipe.tags || "[]"),
      ingredients: ur.recipe.ingredients
        ? JSON.parse(ur.recipe.ingredients)
        : [],
      instructions: ur.recipe.instructions
        ? JSON.parse(ur.recipe.instructions)
        : [],
      savedAt: ur.savedAt,
    }))

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Saved recipes error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



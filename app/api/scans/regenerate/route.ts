import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateRecipesFromIngredients } from "@/lib/server/generateRecipesFromIngredients"

export const runtime = "nodejs"

const regenerateSchema = z.object({
  scanId: z.string().min(1, "scanId is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      )
    }

    const payload = await request.json()
    const validated = regenerateSchema.safeParse(payload)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { scanId } = validated.data

    const scan = await prisma.scan.findFirst({
      where: {
        id: scanId,
        userId: session.user.id,
      },
    })

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    }

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
      ingredients = scan.ingredientsCSV.split(",").map((item) => item.trim()).filter(Boolean)
    }

    if (ingredients.length === 0) {
      return NextResponse.json({ error: "Scan has no ingredients to regenerate" }, { status: 400 })
    }

    const { recipes } = await generateRecipesFromIngredients(ingredients, {
      userId: session.user.id,
    })

    return NextResponse.json({ recipes })
  } catch (error: any) {
    console.error("Failed to regenerate recipes from scan", error)

    if (error?.status === 401) {
      return NextResponse.json({ error: "Invalid OpenAI API key" }, { status: 401 })
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    if (error?.message === "Request timeout") {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 408 }
      )
    }

    return NextResponse.json({ error: "Failed to regenerate recipes" }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { generateRecipesFromIngredients } from "@/lib/server/generateRecipesFromIngredients"

const requestSchema = z.object({
  ingredients: z.array(z.string()).min(1, "At least 1 ingredient is required").max(15, "Maximum 15 ingredients allowed"),
  diet: z.enum(["none", "vegetarian", "vegan", "keto", "gluten-free"]).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      )
    }

    const session = await auth()
    const body = await request.json()
    const validatedFields = requestSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedFields.error.errors },
        { status: 400 }
      )
    }

    const { ingredients, diet } = validatedFields.data
    const { recipes } = await generateRecipesFromIngredients(ingredients, {
      diet,
      userId: session?.user?.id,
    })

    return NextResponse.json({ recipes })
  } catch (error: any) {
    console.error("Recipe generation error:", error)

    // Handle timeout
    if (error.message === "Request timeout") {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 408 }
      )
    }

    // Handle OpenAI API errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key" },
        { status: 401 }
      )
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Recipe generation failed" },
      { status: 500 }
    )
  }
}


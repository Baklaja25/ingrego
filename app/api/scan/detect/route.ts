import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const detectSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
})

const MOCK_INGREDIENTS = [
  "tomato",
  "onion",
  "chicken",
  "cheese",
  "broccoli",
  "rice",
  "pasta",
  "eggs",
  "carrot",
  "milk",
  "garlic",
  "pepper",
  "salt",
  "olive oil",
  "butter",
  "flour",
  "sugar",
  "potato",
  "lettuce",
  "cucumber",
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedFields = detectSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedFields.error.errors },
        { status: 400 }
      )
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock detection: return random 3-6 ingredients
    const numIngredients = Math.floor(Math.random() * 4) + 3
    const shuffled = [...MOCK_INGREDIENTS].sort(() => 0.5 - Math.random())
    const detected = shuffled.slice(0, numIngredients)

    return NextResponse.json({
      ingredients: detected,
    })
  } catch (error) {
    console.error("Detection error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



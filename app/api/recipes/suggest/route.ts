import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const suggestSchema = z.object({
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
})

const MOCK_RECIPES = [
  {
    id: "recipe-1",
    title: "Seafood Spaghetti",
    image: "/images/dish-sea-food-spageti.png",
    cookTimeMins: 25,
    servings: 3,
    summary: "Rich tomato sauce with fresh seafood",
  },
  {
    id: "recipe-2",
    title: "Poke Bowl",
    image: "/images/poke-bowl.png",
    cookTimeMins: 15,
    servings: 2,
    summary: "Fresh salmon with colorful vegetables",
  },
  {
    id: "recipe-3",
    title: "Chicken & Broccoli Bowl",
    image: "/images/white-meed-brocoli.png",
    cookTimeMins: 35,
    servings: 1,
    summary: "Grilled chicken with roasted vegetables",
  },
  {
    id: "recipe-4",
    title: "Tomato Pasta",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
    cookTimeMins: 20,
    servings: 2,
    summary: "Classic Italian pasta with fresh tomatoes",
  },
  {
    id: "recipe-5",
    title: "Vegetable Stir Fry",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
    cookTimeMins: 15,
    servings: 2,
    summary: "Quick and healthy vegetable stir fry",
  },
  {
    id: "recipe-6",
    title: "Chicken Curry",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
    cookTimeMins: 40,
    servings: 4,
    summary: "Spicy and flavorful chicken curry",
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedFields = suggestSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedFields.error.errors },
        { status: 400 }
      )
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Return mock recipes (in real app, this would filter by ingredients)
    return NextResponse.json({
      recipes: MOCK_RECIPES,
    })
  } catch (error) {
    console.error("Recipe suggestion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



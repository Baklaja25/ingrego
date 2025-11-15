export interface Recipe {
  id?: string
  title: string
  description: string
  ingredients: string[]
  spices: string[]
  steps: string[]
  cookTimeMins: number
  servings: string
  difficulty?: string
  imagePrompt?: string
  imageUrl?: string
  thumbnailUrl?: string
}

export async function generateRecipes(
  ingredients: string[],
  diet?: "none" | "vegetarian" | "vegan" | "keto" | "gluten-free"
): Promise<Recipe[]> {
  try {
    const response = await fetch("/api/recipes/from-ingredients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ingredients,
        ...(diet && diet !== "none" && { diet }),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate recipes")
    }

    const recipes: Recipe[] = data.recipes || []

    const recipesWithImages = await Promise.all(
      recipes.map(async (recipe) => {
        if (recipe.imagePrompt) {
          try {
            const [imageResult, thumbResult] = await Promise.allSettled([
              generateRecipeImage(recipe.imagePrompt),
              generateRecipeThumbnail(recipe.imagePrompt),
            ])

            const enhancedRecipe: Recipe = { ...recipe }

            if (imageResult.status === "fulfilled") {
              enhancedRecipe.imageUrl = imageResult.value
            }

            if (thumbResult.status === "fulfilled") {
              enhancedRecipe.thumbnailUrl = thumbResult.value
            }

            return enhancedRecipe
          } catch (error) {
            console.error("generateRecipeImage error:", error)
          }
        }
        return recipe
      })
    )

    return recipesWithImages
  } catch (error: any) {
    console.error("generateRecipes error:", error)
    throw error
  }
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  const res = await fetch("/api/recipes/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Failed to generate image")
  }

  return data.imageUrl
}

export async function generateRecipeThumbnail(prompt: string): Promise<string> {
  const res = await fetch("/api/recipes/thumbnail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Failed to generate thumbnail")
  }

  return data.imageUrl
}

export async function saveGeneratedRecipe(recipe: Recipe) {
  const isValidUrl = (value: unknown) => {
    if (typeof value !== "string" || value.trim().length === 0) return false
    const trimmed = value.trim()

    // Accept data URLs (base64 previews) and http(s) URLs
    if (/^data:image\/[a-zA-Z]+;base64,/.test(trimmed)) {
      return true
    }

    try {
      const parsed = new URL(trimmed)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  }

  const cookTime =
    typeof recipe.cookTimeMins === "number"
      ? recipe.cookTimeMins
      : Number.parseInt(String(recipe.cookTimeMins), 10) || 0

  const sanitizedIngredients = (recipe.ingredients ?? [])
    .map((ingredient) => ingredient.trim())
    .filter(Boolean)
  const sanitizedSteps = (recipe.steps ?? []).map((step) => step.trim()).filter(Boolean)

  if (sanitizedIngredients.length === 0) {
    sanitizedIngredients.push("Ingredient list unavailable. Refer to the generated recipe details.")
  }

  if (sanitizedSteps.length === 0) {
    sanitizedSteps.push("Steps unavailable. Follow the recipe as displayed in the app.")
  }

  const payload = {
    title: recipe.title,
    description: recipe.description ?? "",
    cookTimeMins: cookTime,
    servings: recipe.servings ?? "1 serving",
    difficulty: recipe.difficulty,
    ingredients: sanitizedIngredients,
    spices: (recipe.spices ?? []).map((spice) => spice.trim()).filter(Boolean),
    steps: sanitizedSteps,
    imageUrl: isValidUrl(recipe.imageUrl) ? recipe.imageUrl!.trim() : "",
    thumbnailUrl: isValidUrl(recipe.thumbnailUrl) ? recipe.thumbnailUrl!.trim() : "",
  }

  console.log("[saveGeneratedRecipe] Sending payload", payload)

  const res = await fetch("/api/recipes/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  console.log("[saveGeneratedRecipe] Response", res.status, data)

  if (!res.ok) {
    console.error("[saveGeneratedRecipe] Save failed", res.status, data)
    const details =
      data?.details?.fieldErrors ??
      data?.details?.formErrors ??
      (Array.isArray(data?.details) ? data.details : undefined)
    if (details) {
      throw new Error(
        data.error ||
          `Validation failed: ${JSON.stringify(details)}`
      )
    }
    throw new Error(data?.error || "Failed to save recipe")
  }

  return data as {
    recipeId: string
    recipe?: {
      id: string
      title: string
      image?: string | null
      timeMins: number
      servings: string
      tags?: string[]
    }
  }
}


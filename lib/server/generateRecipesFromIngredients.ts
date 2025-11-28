import { openai } from "@/lib/openai"
import { prisma } from "@/lib/prisma"
import { normalizeIngredients } from "@/lib/normalizeIngredients"
import { updateUserIngredientStats } from "@/lib/updateIngredientStats"

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    recipes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          ingredients: { type: "array", items: { type: "string" } },
          spices: { type: "array", items: { type: "string" } },
          steps: { type: "array", items: { type: "string" } },
          cookTimeMins: { type: "number" },
          servings: { type: "string" },
          difficulty: { type: "string" },
          imagePrompt: { type: "string" },
        },
        required: [
          "title",
          "description",
          "ingredients",
          "spices",
          "steps",
          "cookTimeMins",
          "servings",
          "difficulty",
          "imagePrompt",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["recipes"],
  additionalProperties: false,
} as const

export type GenerateRecipeOptions = {
  diet?: "none" | "vegetarian" | "vegan" | "keto" | "gluten-free"
  userId?: string
}

export async function generateRecipesFromIngredients(
  ingredients: string[],
  options: GenerateRecipeOptions = {}
) {
  const { diet, userId } = options
  // Include diet in cache key to ensure different diets get different cached recipes
  const normalizedIngredients = normalizeIngredients(ingredients)
  const cacheKey = `${normalizedIngredients}|${diet || 'none'}`

  let recipes: any[] = []

  // Try to fetch from cache, but continue if database connection fails
  try {
    const cached = await prisma.recipeCache.findUnique({ where: { ingredients: cacheKey } })
    if (cached) {
      try {
        recipes = cached.recipe ? JSON.parse(cached.recipe) : []
        const hasImagePrompt = recipes.every(
          (recipe: any) => typeof recipe.imagePrompt === "string" && recipe.imagePrompt.length > 0
        )
        if (!hasImagePrompt) {
          recipes = []
        }
      } catch (error) {
        console.error("Failed to parse cached recipes, regenerating", error)
      }
    }
  } catch (error: any) {
    // If database connection fails, log and continue without cache
    console.warn("Database connection failed, skipping cache lookup:", error.message)
  }

  if (recipes.length === 0) {
    const dietInfo = diet && diet !== "none" ? ` (diet: ${diet})` : ""

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "You are a culinary assistant that suggests recipes and lists spices based on given ingredients.",
        },
        {
          role: "user",
          content: `Ingredients: ${ingredients.join(", ")}${dietInfo}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "RecipeResponse",
          schema: RESPONSE_SCHEMA,
        },
      },
    })

    let jsonPayload: any = null
    type OutputContentItem = { type?: string; text?: string }
    type OutputWithContent = { content?: OutputContentItem[] }

    const outputText =
      response.output_text ??
      (() => {
        const outputWithContent = response.output?.find((item) => {
          return typeof item === "object" && item !== null && Array.isArray((item as OutputWithContent).content)
        }) as OutputWithContent | undefined

        const textBlock = outputWithContent?.content?.find(
          (contentItem): contentItem is OutputContentItem => contentItem?.type === "output_text"
        )

        return textBlock?.text
      })()

    if (outputText) {
      try {
        jsonPayload = JSON.parse(outputText)
      } catch (error) {
        console.error("Failed to parse structured recipes response", error, outputText)
      }
    }

    recipes = jsonPayload?.recipes ?? []

    // Try to cache the recipes, but continue if database connection fails
    if (recipes.length > 0) {
      try {
        await prisma.recipeCache.upsert({
          where: { ingredients: cacheKey },
          update: { recipe: JSON.stringify(recipes) },
          create: { ingredients: cacheKey, recipe: JSON.stringify(recipes) },
        })
      } catch (error: any) {
        // If database connection fails, log and continue without caching
        console.warn("Database connection failed, skipping cache save:", error.message)
      }
    }
  }

  if (userId && recipes.length > 0) {
    try {
      const allIngredients = recipes.flatMap((recipe: any) => recipe.ingredients ?? [])
      await updateUserIngredientStats(userId, allIngredients)
    } catch (error: any) {
      // If database connection fails, log and continue
      console.warn("Database connection failed, skipping ingredient stats update:", error.message)
    }
  }

  return { recipes, cacheKey }
}





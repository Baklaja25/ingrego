import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { openai } from "@/lib/openai"

const requestSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
}).refine(
  (data) => data.imageUrl || data.imageBase64,
  {
    message: "Either imageUrl or imageBase64 must be provided",
    path: ["imageUrl"],
  }
)

const INGREDIENT_SCHEMA = {
  type: "object" as const,
  properties: {
    ingredients: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          confidence: { type: "number" as const },
        },
        required: ["name", "confidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["ingredients"],
  additionalProperties: false,
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const validatedFields = requestSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedFields.error.errors },
        { status: 400 }
      )
    }

    const { imageUrl, imageBase64 } = validatedFields.data

    // Preprocess image URL
    let imageInput: string
    if (imageBase64) {
      // Ensure proper data URL format
      if (imageBase64.startsWith("data:")) {
        imageInput = imageBase64
      } else {
        imageInput = `data:image/jpeg;base64,${imageBase64}`
      }
    } else if (imageUrl) {
      imageInput = imageUrl
    } else {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    // Create timeout promise (10 seconds for API call)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 10000)
    })

    // Call OpenAI API with structured outputs
    const apiCall = openai.chat.completions.create({
      model: "gpt-4o-mini", // Lowest cost vision model
      messages: [
        {
          role: "system",
          content: "You are a precise food ingredient detection assistant. You ONLY identify ingredients that are clearly visible in the image. Do not guess, assume, or add ingredients that are not directly visible.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and extract ONLY the food ingredients that are CLEARLY VISIBLE. Follow these strict rules:

CRITICAL RULES:
1. ONLY return ingredients that you can ACTUALLY SEE in the image - do not guess or assume
2. Do NOT add common ingredients that might be in a dish but are not visible (e.g., don't add "salt" or "pepper" unless you see salt/pepper containers or visible seasoning)
3. Do NOT add ingredients based on what a dish typically contains - only what is actually visible
4. If you see cooked food, identify the raw ingredients that are visible (e.g., if you see chunks of meat, return "beef" or "chicken", not "cooked meat")
5. If an ingredient is partially visible or unclear, set confidence below 0.7
6. Return ingredient-level items (e.g., "tomato", not "salad" or "dish")
7. Merge duplicates (e.g., "tomato" and "tomatoes" should become "tomato")
8. Return a maximum of 20 items
9. Use lowercase for ingredient names
10. Confidence should be between 0 and 1, where 1 is certain and lower values indicate uncertainty

EXAMPLES:
- If you see a pot with meat and vegetables cooking, return: "beef", "potato", "carrot" (only if clearly visible)
- Do NOT add: "salt", "pepper", "oil" unless you see these items/containers in the image
- If you see a salad with lettuce, tomatoes, and cucumbers, return: "lettuce", "tomato", "cucumber"
- Do NOT add ingredients that might be in a typical salad but are not visible

Return the ingredients as a structured JSON object with:
- name: ingredient name (string, lowercase)
- confidence: confidence score 0-1 (number, where 0.8+ means clearly visible, 0.5-0.7 means somewhat visible, below 0.5 means uncertain)`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageInput,
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ingredient_extraction",
          strict: true,
          schema: INGREDIENT_SCHEMA,
        },
      },
      max_tokens: 1000,
    })

    // Race between API call and timeout
    const response = await Promise.race([apiCall, timeoutPromise]) as Awaited<typeof apiCall>

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      )
    }

    let parsedContent
    try {
      parsedContent = JSON.parse(content)
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to parse OpenAI response" },
        { status: 500 }
      )
    }

    // Extract ingredient names with confidence filtering
    // Only include ingredients with confidence >= 0.6 (clearly visible or better)
    const ingredients = parsedContent.ingredients
      ?.filter((ing: any) => {
        const confidence = ing.confidence ?? 0
        return confidence >= 0.6 // Only include if clearly visible (0.6 = somewhat visible, 0.8+ = clearly visible)
      })
      .map((ing: any) => ing.name?.toLowerCase().trim())
      .filter((name: string) => name && name.length > 0)
      .filter((name: string, index: number, arr: string[]) => arr.indexOf(name) === index) // Deduplicate
      .slice(0, 20) || []

    return NextResponse.json({
      ingredients,
    })
  } catch (error: any) {
    console.error("Ingredient detection error:", error)

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
      { error: error.message || "Failed to detect ingredients" },
      { status: 500 }
    )
  }
}


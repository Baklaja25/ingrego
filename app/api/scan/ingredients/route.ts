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
          content: "You are a grocery vision assistant. Identify visible, edible ingredients.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and extract all visible food ingredients. Follow these rules:
1. Return ingredient-level items (e.g., "tomato", not "salad" or "dish").
2. Merge duplicates (e.g., "tomato" and "tomatoes" should become "tomato").
3. If unsure about an ingredient, include it but set a lower confidence score.
4. Return a maximum of 20 items.
5. Use lowercase for ingredient names.
6. Confidence should be between 0 and 1, where 1 is certain and lower values indicate uncertainty.

Return the ingredients as a structured JSON object with:
- name: ingredient name (string, lowercase)
- confidence: confidence score 0-1 (number)`,
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

    // Extract just the ingredient names (lowercase, deduplicated)
    const ingredients = parsedContent.ingredients
      ?.map((ing: any) => ing.name?.toLowerCase().trim())
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


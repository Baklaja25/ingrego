import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { openai } from "@/lib/openai"
import { rateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"

const requestSchema = z.object({
  imageBase64: z.string().optional(),
}).refine(
  (data) => data.imageBase64,
  {
    message: "imageBase64 must be provided",
    path: ["imageBase64"],
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
    // Rate limiting: 10 requests per minute per IP/user
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = rateLimit({
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      identifier,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.resetTime),
          },
        }
      )
    }

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

    const { imageBase64 } = validatedFields.data

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    // Validate base64 format
    let base64Data: string
    let mimeType: string = "image/jpeg"

    if (imageBase64.startsWith("data:")) {
      // Parse data URL: data:image/jpeg;base64,<data>
      const match = imageBase64.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/i)
      if (!match) {
        return NextResponse.json(
          { error: "Invalid data URL format. Must be: data:image/<type>;base64,<data>" },
          { status: 400 }
        )
      }
      mimeType = `image/${match[1].toLowerCase()}`
      base64Data = match[2]
    } else {
      // Assume raw base64, default to JPEG
      base64Data = imageBase64
    }

    // Validate base64 string format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    if (!base64Regex.test(base64Data)) {
      return NextResponse.json(
        { error: "Invalid base64 format" },
        { status: 400 }
      )
    }

    // Validate base64 length (reasonable image size: max ~10MB when decoded)
    const maxBase64Length = 10 * 1024 * 1024 * 1.33 // ~10MB * 1.33 (base64 overhead)
    if (base64Data.length > maxBase64Length) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    // Decode and validate it's actually an image by checking magic bytes
    try {
      const buffer = Buffer.from(base64Data, "base64")
      
      // Check magic bytes for image formats
      const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF
      const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47
      const isGIF = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46
      const isWebP = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
      
      if (!isJPEG && !isPNG && !isGIF && !isWebP) {
        return NextResponse.json(
          { error: "Invalid image format. Only JPEG, PNG, WebP, and GIF are supported." },
          { status: 400 }
        )
      }

    } catch (error) {
      return NextResponse.json(
        { error: "Failed to decode base64 image" },
        { status: 400 }
      )
    }

    // Reconstruct data URL with validated format
    const imageInput = `data:${mimeType};base64,${base64Data}`

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


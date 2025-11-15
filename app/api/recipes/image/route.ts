import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { openai } from "@/lib/openai"

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
})

export async function POST(request: NextRequest) {
  try {
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

    const { prompt } = validatedFields.data

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1,
      quality: "high",
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      )
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error("Recipe image generation error:", error)

    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key" },
        { status: 401 }
      )
    }

    if (error.status === 403) {
      return NextResponse.json(
        {
          error:
            "Image generation is disabled because the OpenAI organization is not verified. Please verify your org or upgrade plan.",
        },
        { status: 403 }
      )
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    return NextResponse.json({ error: "Image generation failed" }, { status: 500 })
  }
}




import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { openai } from "@/lib/openai"

const schema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters"),
})

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { imageUrl: "/images/thumb-placeholder.jpg" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { prompt } = schema.parse(body)

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt:
        prompt +
        " food photography, minimalistic thumbnail view, soft lighting, high contrast",
      size: "256x256",
      n: 1,
      quality: "medium",
    })

    const imageUrl = response.data?.[0]?.url || "/images/thumb-placeholder.jpg"
    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error("Thumbnail generation error:", error)

    if (error.status === 403) {
      return NextResponse.json(
        {
          imageUrl: "/images/thumb-placeholder.jpg",
          error:
            "Image generation unavailable until the OpenAI organization is verified.",
        },
        { status: 403 }
      )
    }

    return NextResponse.json({ imageUrl: "/images/thumb-placeholder.jpg" })
  }
}




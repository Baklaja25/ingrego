import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { normalizeIngredients } from "@/lib/normalizeIngredients"
import { saveScanSchema, sanitizeIngredients } from "@/lib/server/scans-utils"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    const validated = saveScanSchema.safeParse(payload)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { imageUrl, ingredients } = validated.data
    const cleanedIngredients = sanitizeIngredients(ingredients)

    if (cleanedIngredients.length === 0) {
      return NextResponse.json({ error: "At least one ingredient is required" }, { status: 400 })
    }

    const cacheKey = normalizeIngredients(cleanedIngredients)

    const scan = await prisma.scan.create({
      data: {
        userId: session.user.id,
        imageUrl: imageUrl ?? null,
        ingredientsCSV: cacheKey,
        ingredientsJSON: JSON.stringify(cleanedIngredients),
        cacheKey,
      },
      select: {
        id: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      id: scan.id,
      createdAt: scan.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Failed to save scan", error)
    return NextResponse.json({ error: "Failed to save scan" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limitParam = Number.parseInt(searchParams.get("limit") ?? "10", 10)
    const limit = Number.isNaN(limitParam) ? 10 : Math.min(Math.max(limitParam, 1), 50)
    const cursor = searchParams.get("cursor") ?? undefined

    const scans = await prisma.scan.findMany({
      where: { userId: session.user.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    })

    const hasMore = scans.length > limit
    const items = (hasMore ? scans.slice(0, limit) : scans).map((scan) => {
      let ingredients: string[] = []
      if (scan.ingredientsJSON) {
        try {
          const parsed = JSON.parse(scan.ingredientsJSON)
          if (Array.isArray(parsed)) {
            ingredients = parsed.map((item) => String(item).trim()).filter(Boolean)
          }
        } catch (error) {
          console.error("Failed to parse ingredientsJSON, falling back to CSV", error)
        }
      }

      if (ingredients.length === 0) {
        ingredients = scan.ingredientsCSV.split(",").map((item) => item.trim()).filter(Boolean)
      }

      return {
        id: scan.id,
        createdAt: scan.createdAt.toISOString(),
        imageUrl: scan.imageUrl ?? undefined,
        ingredients,
        cacheKey: scan.cacheKey,
      }
    })

    const nextCursor = hasMore ? scans[limit].id : undefined

    return NextResponse.json(
      nextCursor
        ? {
            items,
            nextCursor,
          }
        : { items }
    )
  } catch (error) {
    console.error("Failed to load scans", error)
    return NextResponse.json({ error: "Failed to load scans" }, { status: 500 })
  }
}


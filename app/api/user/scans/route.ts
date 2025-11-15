import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10")

    const scans = await prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        imageUrl: true,
        ingredientsJSON: true,
        ingredientsCSV: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      scans: scans.map((scan) => {
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

        if (ingredients.length === 0 && scan.ingredientsCSV) {
          ingredients = scan.ingredientsCSV.split(",").map((item) => item.trim()).filter(Boolean)
        }

        return {
          id: scan.id,
          imageUrl: scan.imageUrl ?? undefined,
          ingredients,
          createdAt: scan.createdAt.toISOString(),
        }
      }),
    })
  } catch (error) {
    console.error("Scans error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



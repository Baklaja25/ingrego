import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get all connected accounts
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        provider: true,
        type: true,
      },
    })

    const connections = {
      google: accounts.some((acc) => acc.provider === "google"),
    }

    return NextResponse.json({ connections })
  } catch (error) {
    console.error("Connections error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



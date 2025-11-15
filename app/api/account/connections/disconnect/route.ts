import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export const runtime = "nodejs"

const disconnectSchema = z.object({
  provider: z.enum(["google"]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    const validatedFields = disconnectSchema.safeParse(body)
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      )
    }

    const { provider } = validatedFields.data

    // Check if user has a password (can't disconnect if it's the only auth method)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user?.password) {
      return NextResponse.json(
        { error: "Cannot disconnect. Please set a password first." },
        { status: 400 }
      )
    }

    // Delete the account connection
    await prisma.account.deleteMany({
      where: {
        userId,
        provider,
      },
    })

    return NextResponse.json({
      message: `${provider} account disconnected successfully`,
    })
  } catch (error) {
    console.error("Disconnect error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



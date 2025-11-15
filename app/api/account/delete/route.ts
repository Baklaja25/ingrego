import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export const runtime = "nodejs"

const deleteAccountSchema = z.object({
  confirm: z.literal("DELETE"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    // Validate confirmation
    const validatedFields = deleteAccountSchema.safeParse(body)
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Please type DELETE to confirm" },
        { status: 400 }
      )
    }

    // Delete user and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete user recipes
      await tx.userRecipe.deleteMany({
        where: { userId },
      })

      // Delete scans
      await tx.scan.deleteMany({
        where: { userId },
      })

      // Delete meal plans
      await tx.mealPlan.deleteMany({
        where: { userId },
      })

      // Delete accounts (OAuth connections)
      await tx.account.deleteMany({
        where: { userId },
      })

      // Delete sessions
      await tx.session.deleteMany({
        where: { userId },
      })

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      })
    })

    return NextResponse.json({
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



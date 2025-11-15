import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/auth"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validatedFields = loginSchema.safeParse(body)
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedFields.error.errors },
        { status: 400 }
      )
    }

    const { email, password } = validatedFields.data

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      return NextResponse.json(
        { message: "Login successful" },
        { status: 200 }
      )
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Invalid email or password" },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


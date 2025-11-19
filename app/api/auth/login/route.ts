import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/auth"
import { z } from "zod"
import { rateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 login attempts per 15 minutes per IP (prevents brute force)
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = rateLimit({
      maxRequests: 10,
      windowMs: 15 * 60 * 1000, // 15 minutes
      identifier,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
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


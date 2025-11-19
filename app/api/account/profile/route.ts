import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { profileSchema } from "@/lib/validations/account"
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export const runtime = "nodejs"

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const formData = await request.formData()
    const name = formData.get("name") as string
    const avatar = formData.get("avatar") as File | null

    // Validate name
    const validatedFields = profileSchema.safeParse({ name })
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedFields.error.errors },
        { status: 400 }
      )
    }

    let imageUrl = session.user.image

    // Handle avatar upload
    if (avatar && avatar.size > 0) {
      // Validate file size (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
      if (avatar.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit" },
          { status: 400 }
        )
      }

      // Validate MIME type
      const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!ALLOWED_MIME_TYPES.includes(avatar.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
          { status: 400 }
        )
      }

      // Validate file extension (whitelist)
      const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
      const extension = avatar.name.split(".").pop()?.toLowerCase()
      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        return NextResponse.json(
          { error: "Invalid file extension" },
          { status: 400 }
        )
      }

      // Verify file is actually an image by checking magic bytes
      const bytes = await avatar.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Check magic bytes for image formats
      const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF
      const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47
      const isGIF = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46
      const isWebP = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
      
      if (!isJPEG && !isPNG && !isGIF && !isWebP) {
        return NextResponse.json(
          { error: "File is not a valid image" },
          { status: 400 }
        )
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads")
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Generate unique filename (use validated extension)
      const timestamp = Date.now()
      const filename = `avatar-${userId}-${timestamp}.${extension}`
      const filepath = join(uploadsDir, filename)

      // Save file
      await writeFile(filepath, buffer)

      // Update image URL
      imageUrl = `/uploads/${filename}`
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedFields.data.name,
        image: imageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



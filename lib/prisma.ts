import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL is set and has correct format
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
    "Please add it to your Vercel project settings: " +
    "Settings → Environment Variables → Add DATABASE_URL"
  )
}

// Validate DATABASE_URL format for PostgreSQL
if (
  !process.env.DATABASE_URL.startsWith("postgresql://") &&
  !process.env.DATABASE_URL.startsWith("postgres://")
) {
  throw new Error(
    `Invalid DATABASE_URL format. Expected URL to start with 'postgresql://' or 'postgres://', but got: ${process.env.DATABASE_URL.substring(0, 20)}...` +
    "\nPlease check your Vercel environment variables: Settings → Environment Variables → DATABASE_URL"
  )
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma




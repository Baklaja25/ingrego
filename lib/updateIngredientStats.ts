import { prisma } from "@/lib/prisma"

export async function updateUserIngredientStats(userId: string, ingredients: string[]) {
  if (!userId || ingredients.length === 0) {
    return
  }

  const unique = Array.from(
    new Set(
      ingredients
        .map((ingredient) => ingredient.trim().toLowerCase())
        .filter((ingredient) => ingredient.length > 0)
    )
  )

  if (unique.length === 0) {
    return
  }

  for (const ingredient of unique) {
    await prisma.userIngredientStat.upsert({
      where: { userId_ingredient: { userId, ingredient } },
      update: { count: { increment: 1 } },
      create: { userId, ingredient, count: 1 },
    })
  }
}































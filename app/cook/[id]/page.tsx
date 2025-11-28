import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CookModeClient, CookModeRecipe } from "@/components/cook-mode/CookModeClient"

function parseJson(value?: string | null) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item))
    }
    return []
  } catch {
    return []
  }
}

export default async function CookModePage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/auth/login?from=/cook/${params.id}`)
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      ingredients: true,
      instructions: true,
    },
  })

  if (!recipe) {
    notFound()
  }

  const steps =
    Array.isArray(recipe.instructions)
      ? (recipe.instructions as unknown as string[])
      : parseJson(recipe.instructions) || []

  const ingredients =
    Array.isArray(recipe.ingredients)
      ? (recipe.ingredients as unknown as string[])
      : parseJson(recipe.ingredients) || []

  const cookRecipe: CookModeRecipe = {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    image: recipe.image,
    steps: steps.length > 0 ? steps : ["No instructions provided for this recipe."],
    ingredients,
  }

  return <CookModeClient recipe={cookRecipe} />
}





























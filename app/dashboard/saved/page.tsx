import { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { RecipeCard } from "@/components/dashboard/recipe-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SavedRecipesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?from=/dashboard/saved")
  }

  const userId = session.user.id

  type SavedRecipeWithDetails = Prisma.UserRecipeGetPayload<{
    include: { recipe: true }
  }>

  let savedRecipes: SavedRecipeWithDetails[] = []
  try {
    if (prisma.userRecipe) {
      savedRecipes = await prisma.userRecipe.findMany({
        where: { userId },
        include: {
          recipe: true,
        },
        orderBy: { savedAt: "desc" },
      })
    }
  } catch (error) {
    console.error("Error fetching saved recipes:", error)
    savedRecipes = []
  }

  const recipes = savedRecipes.map((ur: any) => ({
    ...ur.recipe,
    tags: JSON.parse(ur.recipe.tags || "[]"),
    ingredients: ur.recipe.ingredients ? JSON.parse(ur.recipe.ingredients) : [],
    instructions: ur.recipe.instructions ? JSON.parse(ur.recipe.instructions) : [],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saved Recipes</h1>
        <p className="text-muted-foreground">
          Your favorite recipes saved for later
        </p>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No saved recipes yet</CardTitle>
            <CardDescription className="mb-4 text-center">
              Start saving your favorite recipes to access them quickly
            </CardDescription>
            <Link href="/">
              <Button>Browse Recipes</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}


import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users } from "lucide-react"

interface Recipe {
  id: string
  title: string
  image?: string | null
  timeMins: number
  servings: number
  description?: string | null
  tags?: string[]
  rating?: number | null
  spices?: string[]
}

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="hover:shadow-lg transition-shadow h-full">
        <div className="relative w-full h-48 overflow-hidden rounded-t-2xl bg-muted">
          <Image
            src={recipe.image || "/images/ingrego-recipe.png"}
            alt={recipe.title}
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
          {recipe.description && (
            <CardDescription className="line-clamp-2">
              {recipe.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.timeMins} mins</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings} servings</span>
            </div>
            {recipe.rating && (
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span>{recipe.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {recipe.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent text-accent-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {recipe.spices && recipe.spices.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {recipe.spices.map((spice) => (
                <Badge key={spice} variant="outline" className="text-xs capitalize">
                  {spice}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}


"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GeneratedRecipeGrid } from "@/components/scan/generated-recipe-grid"
import { getScans, regenerateFromScan, type ScanItem } from "@/lib/scans"
import { Recipe } from "@/lib/generateRecipes"

interface ScanHistoryProps {
  initialItems: ScanItem[]
  initialNextCursor?: string
}

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleString()
}

export function ScanHistory({ initialItems, initialNextCursor }: ScanHistoryProps) {
  const [items, setItems] = useState<ScanItem[]>(initialItems)
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialNextCursor)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [showResults, setShowResults] = useState(false)

  const router = useRouter()

  const handleLoadMore = async () => {
    if (!nextCursor) return
    setIsLoadingMore(true)
    try {
      const data = await getScans(10, nextCursor)
      setItems((prev) => [...prev, ...data.items])
      setNextCursor(data.nextCursor)
    } catch (error: any) {
      toast.error(error.message || "Failed to load more scans")
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleRegenerate = async (scanId: string) => {
    setRegeneratingId(scanId)
    try {
      const { recipes: generated } = await regenerateFromScan(scanId)
      setRecipes(generated)
      setShowResults(true)

      const recipeCount = generated.length
      toast.success(
        recipeCount
          ? `Generated ${recipeCount} recipe${recipeCount !== 1 ? "s" : ""} from this scan`
          : "No recipes returned for this scan. Try scanning again."
      )

      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate recipes")
    } finally {
      setRegeneratingId(null)
    }
  }

  if (!items.length) {
    return (
      <Card className="border-dashed border-primary/40 bg-[#FBEED7]">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <p className="text-lg font-semibold text-primary">No scans yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Scan your fridge or pantry ingredients to build your personal history and revisit them
            anytime.
          </p>
          <Button className="bg-[#FF8C42] hover:bg-[#ff7b22] text-white rounded-full px-6" size="lg" asChild>
            <Link href="/scan">Start scanning</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        {items.map((scan) => (
          <Card
            key={scan.id}
            className="rounded-2xl border border-[#FBEED7] bg-white shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-[#FF8C42]"
          >
            <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                <div className="relative h-32 w-32 overflow-hidden rounded-2xl bg-[#FBEED7]">
                  {scan.imageUrl ? (
                    <Image
                      src={scan.imageUrl}
                      alt={`Scan ${scan.id}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-primary/60">
                      No image
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {formatDate(scan.createdAt)}
                    </p>
                    <h3 className="text-xl font-semibold text-[#FF8C42]">
                      Scan #{scan.id.slice(0, 8)}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {scan.ingredients.map((ingredient) => (
                      <Badge
                        key={ingredient}
                        variant="secondary"
                        className="rounded-full bg-[#FBEED7] text-primary border border-[#FF8C42]/30 capitalize"
                      >
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                <Button
                  onClick={() => handleRegenerate(scan.id)}
                  disabled={regeneratingId === scan.id}
                  className="rounded-full bg-[#FF8C42] text-white hover:bg-[#ff7b22]"
                >
                  {regeneratingId === scan.id ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Regenerating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCcw className="h-4 w-4" />
                      Generate recipes again
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {nextCursor && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="rounded-full border-primary text-primary hover:bg-[#FBEED7]"
            >
              {isLoadingMore ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                "Load more scans"
              )}
            </Button>
          </div>
        )}
      </div>

      {showResults && (
        <section className="space-y-4 rounded-3xl border border-[#FBEED7] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#FF8C42]">Regenerated recipes</h2>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80"
              onClick={() => setShowResults(false)}
            >
              Hide results
            </Button>
          </div>
          <GeneratedRecipeGrid recipes={recipes} />
        </section>
      )}
    </div>
  )
}







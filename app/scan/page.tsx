"use client"

import { useCallback, useEffect, useState } from "react"
import { ScanTabs } from "@/components/scan/scan-tabs"
import { IngredientEditor } from "@/components/scan/ingredient-editor"
import { GeneratedRecipeGrid } from "@/components/scan/generated-recipe-grid"
import { Button } from "@/components/ui/button"
import { useScanStore } from "@/stores/scan-store"
import { toast } from "sonner"
import { Loader2, Sparkles, Menu } from "lucide-react"
import { generateRecipes, Recipe, saveGeneratedRecipe } from "@/lib/generateRecipes"
import Link from "next/link"
import {
  getScans,
  regenerateFromScan as regenerateFromScanApi,
  saveScan,
  type ScanItem,
} from "@/lib/scans"
import { MiniScanList } from "@/components/MiniScanList"

export default function ScanPage() {
  const { ingredients, imageUrl, capturedImage } = useScanStore()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false)
  const [savingRecipeIndex, setSavingRecipeIndex] = useState<number | null>(null)
  const [recentScans, setRecentScans] = useState<ScanItem[]>([])
  const [isRecentScansLoading, setIsRecentScansLoading] = useState(false)
  const [regeneratingScanId, setRegeneratingScanId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const loadRecentScans = useCallback(async () => {
    setIsRecentScansLoading(true)
    try {
      const data = await getScans(6)
      setRecentScans(data.items)
    } catch (error: any) {
      console.error("Failed to load recent scans", error)
      toast.error(error.message || "Failed to load recent scans")
    } finally {
      setIsRecentScansLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRecentScans()
  }, [loadRecentScans])

  const handleGetRecipes = async () => {
    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient")
      return
    }

    if (ingredients.length > 15) {
      toast.error("Maximum 15 ingredients allowed")
      return
    }

    setIsLoadingRecipes(true)
    try {
      try {
        const saved = await saveScan({
          imageUrl: imageUrl ?? capturedImage ?? undefined,
          ingredients,
        })
        toast.success("Scan saved to history")
        await loadRecentScans()
      } catch (error: any) {
        const message = error?.message
        if (message?.toLowerCase().includes("unauthorized")) {
          toast.info("Log in to save scans in your history.")
        } else if (message) {
          toast.error(message)
        } else {
          toast.error("Failed to save scan")
        }
      }

      const generatedRecipes = await generateRecipes(ingredients)
      setRecipes(generatedRecipes)
      toast.success(
        `Generated ${generatedRecipes.length} recipe${generatedRecipes.length !== 1 ? "s" : ""}`
      )
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to generate recipes. Please try again."
      toast.error(errorMessage)
      setRecipes([])
    } finally {
      setIsLoadingRecipes(false)
    }
  }

  const handleRegenerateFromScan = async (scanId: string) => {
    setRegeneratingScanId(scanId)
    setIsLoadingRecipes(true)
    try {
      const { recipes: regenerated } = await regenerateFromScanApi(scanId)
      setRecipes(regenerated)
      const recipeCount = regenerated.length
      toast.success(
        recipeCount
          ? `Regenerated ${recipeCount} recipe${recipeCount !== 1 ? "s" : ""}`
          : "No recipes returned for this scan."
      )
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate recipes")
    } finally {
      setIsLoadingRecipes(false)
      setRegeneratingScanId(null)
    }
  }

  const handleSaveRecipe = async (recipe: Recipe, index: number) => {
    setSavingRecipeIndex(index)
    try {
      console.log("[ScanPage] Saving recipe", { title: recipe.title, index })
      const saved = await saveGeneratedRecipe(recipe)
      console.log("[ScanPage] Recipe saved", saved)
      setRecipes((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? {
                ...item,
                id: saved.recipeId,
                servings: saved.recipe?.servings ?? item.servings,
                imageUrl: saved.recipe?.image ?? item.imageUrl,
              }
            : item
        )
      )
      toast.success(`Saved "${recipe.title}" to your recipes`)
    } catch (error: any) {
      console.error("[ScanPage] Failed to save recipe", error)
      const message = error?.message || "Failed to save recipe"
      if (message.toLowerCase().includes("unauthorized")) {
        toast.info("Log in to save recipes.")
      } else if (message.toLowerCase().includes("already saved")) {
        toast.info("Recipe already saved.")
      } else {
        toast.error(message)
      }
    } finally {
      setSavingRecipeIndex(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
        <div className="max-w-md mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-lg font-semibold text-[#0F172A]">
                Ingre<span className="text-[#FF8C42]">Go</span>
              </span>
            </Link>

            {/* Hamburger Menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-50 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-5 w-5 text-[#0F172A]" />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-slate-100 py-2 space-y-1">
              <Link 
                href="/" 
                className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/scan" 
                className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Scan
              </Link>
              <Link 
                href="/meal-planner" 
                className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Meal Planner
              </Link>
              <Link 
                href="/blog" 
                className="block px-4 py-2 text-sm text-[#0F172A] hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-6 pb-10">
        {/* Hero Section */}
        <section className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#0F172A] leading-tight">
            Scan your<br />
            ingredients
          </h1>
          <p className="text-base text-slate-500 max-w-[30ch]">
            Take a photo or upload an image of your ingredients to get personalized recipes.
          </p>
        </section>

        {/* Primary Actions */}
        <section className="mt-8 space-y-3">
          <ScanTabs />
        </section>

        {/* Detected Ingredients Section */}
        <section className="mt-10">
          <IngredientEditor />
        </section>

        {/* Get Recipes Button */}
        <div className="mt-8">
          <Button
            type="button"
            onClick={handleGetRecipes}
            disabled={ingredients.length === 0 || isLoadingRecipes}
            className="w-full min-h-[56px] bg-[#FF8C42] hover:bg-[#ff7b22] text-white text-base font-medium rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingRecipes ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding Recipes...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Get Recipes
              </>
            )}
          </Button>
        </div>

        {/* Recipe Results */}
        {(recipes.length > 0 || isLoadingRecipes) && (
          <section className="mt-10 space-y-4">
            <h2 className="text-xl font-semibold text-[#0F172A]">Generated Recipes</h2>
            <GeneratedRecipeGrid
              recipes={recipes}
              isLoading={isLoadingRecipes}
              onSaveRecipe={handleSaveRecipe}
              savingRecipeIndex={savingRecipeIndex}
            />
          </section>
        )}

        {/* Recent Scans */}
        <section className="mt-10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-[#0F172A]">Recent scans</h3>
            <Button variant="link" className="text-[#FF8C42] p-0 h-auto font-normal" asChild>
              <Link href="/dashboard/scans">View history</Link>
            </Button>
          </div>
          <MiniScanList
            scans={recentScans}
            isLoading={isRecentScansLoading}
            onRegenerate={handleRegenerateFromScan}
            regeneratingId={regeneratingScanId}
          />
        </section>
      </main>
    </div>
  )
}

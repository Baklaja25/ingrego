"use client"

import { useCallback, useEffect, useState } from "react"
import { Header } from "@/components/header"
import { ScanTabs } from "@/components/scan/scan-tabs"
import { IngredientEditor } from "@/components/scan/ingredient-editor"
import { GeneratedRecipeGrid } from "@/components/scan/generated-recipe-grid"
import { Button } from "@/components/ui/button"
import { useScanStore } from "@/stores/scan-store"
import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { generateRecipes, Recipe, saveGeneratedRecipe } from "@/lib/generateRecipes"
import {
  getScans,
  regenerateFromScan as regenerateFromScanApi,
  saveScan,
  type ScanItem,
} from "@/lib/scans"
import { MiniScanList } from "@/components/MiniScanList"
import Link from "next/link"

export default function ScanPage() {
  const { ingredients, imageUrl, capturedImage } = useScanStore()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false)
  const [savingRecipeIndex, setSavingRecipeIndex] = useState<number | null>(null)
  const [recentScans, setRecentScans] = useState<ScanItem[]>([])
  const [isRecentScansLoading, setIsRecentScansLoading] = useState(false)
  const [regeneratingScanId, setRegeneratingScanId] = useState<string | null>(null)

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
    <div className="min-h-screen bg-gradient-to-br from-white to-accent/30">
      <Header />
      <div className="container max-w-6xl py-8 px-4 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Scan Your Ingredients
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take a photo or upload an image of your ingredients to get
            personalized recipes.
          </p>
        </motion.div>

        {/* Scan Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ScanTabs />
        </motion.div>

        {/* Ingredient Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <IngredientEditor />
        </motion.div>

        {/* Get Recipes Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleGetRecipes}
            size="lg"
            disabled={ingredients.length === 0 || isLoadingRecipes}
            className="bg-[#FF8C42] hover:bg-[#ff7b22] text-white px-8 py-6 text-lg rounded-full"
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
        </motion.div>

        {/* Recipe Results */}
        {(recipes.length > 0 || isLoadingRecipes) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Generated Recipes</h2>
            <GeneratedRecipeGrid
              recipes={recipes}
              isLoading={isLoadingRecipes}
              onSaveRecipe={handleSaveRecipe}
              savingRecipeIndex={savingRecipeIndex}
            />
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-primary">Recent scans</h3>
            <Button variant="link" className="text-primary p-0" asChild>
              <Link href="/dashboard/scans">View history</Link>
            </Button>
          </div>
          <MiniScanList
            scans={recentScans}
            isLoading={isRecentScansLoading}
            onRegenerate={handleRegenerateFromScan}
            regeneratingId={regeneratingScanId}
          />
        </motion.section>
      </div>
    </div>
  )
}

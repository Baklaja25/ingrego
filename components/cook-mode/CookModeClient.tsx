"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CookModeLayout } from "@/components/cook-mode/CookModeLayout"
import { StepView } from "@/components/cook-mode/StepView"
import { IngredientChecklist } from "@/components/cook-mode/IngredientChecklist"
import { useCookModeStore } from "@/stores/cook-mode-store"

export type CookModeRecipe = {
  id: string
  title: string
  description?: string | null
  image?: string | null
  steps: string[]
  ingredients: string[]
}

export function CookModeClient({ recipe }: { recipe: CookModeRecipe }) {
  const router = useRouter()
  const steps = useCookModeStore((state) => state.steps)
  const currentStep = useCookModeStore((state) => state.currentStep)
  const setSteps = useCookModeStore((state) => state.setSteps)
  const setStep = useCookModeStore((state) => state.setStep)
  const [showChecklist, setShowChecklist] = useState(true)

  useEffect(() => {
    setSteps(recipe.steps.length > 0 ? recipe.steps : ["No instructions provided."])
  }, [recipe.steps, setSteps])

  const exitToRecipe = useCallback(() => {
    router.push(`/recipes/${recipe.id}`)
  }, [recipe.id, router])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (showChecklist) return
      if (event.key === "Escape") {
        event.preventDefault()
        exitToRecipe()
        return
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        setStep(Math.max(0, currentStep - 1))
        return
      }
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault()
        setStep(currentStep + 1)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [currentStep, exitToRecipe, setStep, showChecklist])

  const ingredients = useMemo(() => recipe.ingredients ?? [], [recipe.ingredients])

  return (
    <>
      <CookModeLayout
        title={recipe.title}
        currentStep={currentStep}
        totalSteps={steps.length}
        onExit={exitToRecipe}
        onExitHref={`/recipes/${recipe.id}`}
      >
        <StepView recipeTitle={recipe.title} recipeId={recipe.id} />
      </CookModeLayout>

      <IngredientChecklist
        ingredients={ingredients}
        open={showChecklist}
        onStart={() => setShowChecklist(false)}
      />
    </>
  )
}


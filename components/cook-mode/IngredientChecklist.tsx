"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface IngredientChecklistProps {
  ingredients: string[]
  open: boolean
  onStart: () => void
}

export function IngredientChecklist({ ingredients, open, onStart }: IngredientChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const handleToggle = (ingredient: string, value: boolean) => {
    setChecked((prev) => ({ ...prev, [ingredient]: value }))
  }

  const allChecked =
    ingredients.length === 0 || ingredients.every((ingredient) => checked[ingredient])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-xl rounded-3xl border border-[#FF8C42]/30 bg-gradient-to-br from-[#1E1E1E] via-[#0f0f0f] to-[#1E1E1E] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Gather your ingredients</DialogTitle>
          <DialogDescription className="text-sm text-white/70">
            Check each item as you prepare it. You can start cooking once everything is ready.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid gap-3">
          {ingredients.length === 0 ? (
            <p className="text-sm text-white/60">No ingredient list available for this recipe.</p>
          ) : (
            ingredients.map((ingredient) => (
              <label
                key={ingredient}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm"
              >
                <Checkbox
                  checked={checked[ingredient] ?? false}
                  onChange={(event) => handleToggle(ingredient, event.target.checked)}
                  className="border-white/40 data-[state=checked]:bg-[#FF8C42] data-[state=checked]:border-[#FF8C42]"
                />
                <span className="text-sm text-white/90">{ingredient}</span>
              </label>
            ))
          )}
        </div>

        <Button
          onClick={onStart}
          disabled={!allChecked}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] text-white hover:brightness-105 disabled:opacity-50"
        >
          Start cooking
        </Button>
      </DialogContent>
    </Dialog>
  )
}





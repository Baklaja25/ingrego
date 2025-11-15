"use client"

import { useState, KeyboardEvent } from "react"
import { useScanStore } from "@/stores/scan-store"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function IngredientEditor() {
  const { ingredients, addIngredient, removeIngredient } = useScanStore()
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      addIngredient(inputValue)
      setInputValue("")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Detected Ingredients
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          We detect ingredients automatically. You can also add your own.
        </p>
        <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 border rounded-lg bg-background">
          <AnimatePresence mode="popLayout">
            {ingredients.map((ingredient) => (
              <motion.div
                key={ingredient}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 pr-1 pl-3 py-1.5"
                >
                  <span className="capitalize">{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient)}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                    aria-label={`Remove ${ingredient}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
          <Input
            type="text"
            placeholder="Add ingredient (press Enter)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="inline-flex w-auto min-w-[200px] h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
          />
        </div>
      </div>
    </div>
  )
}



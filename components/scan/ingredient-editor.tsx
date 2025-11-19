"use client"

import { useState, KeyboardEvent } from "react"
import { useScanStore } from "@/stores/scan-store"
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
    <div className="space-y-3">
      {/* Section Title */}
      <div>
        <h2 className="text-base font-medium text-[#0F172A]">
          Detected ingredients
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          We detect ingredients automatically. You can also add your own.
        </p>
      </div>

      {/* Ingredient Chips */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {ingredients.map((ingredient) => (
              <motion.div
                key={ingredient}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FBEED7] rounded-full text-sm text-[#0F172A]">
                  <span className="capitalize">{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient)}
                    className="ml-0.5 rounded-full hover:bg-[#FF8C42]/20 p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-1"
                    aria-label={`Remove ${ingredient}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Ingredient Input */}
      <Input
        type="text"
        placeholder="Add an ingredient…"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-12 rounded-xl border-slate-200 bg-white text-[#0F172A] placeholder:text-slate-400 focus:border-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42]/20 focus:ring-offset-0 transition-all"
      />
    </div>
  )
}

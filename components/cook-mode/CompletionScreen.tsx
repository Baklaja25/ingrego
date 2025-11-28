"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CompletionScreenProps {
  recipeId: string
  recipeTitle: string
}

const confettiPieces = Array.from({ length: 40 })

export function CompletionScreen({ recipeId, recipeTitle }: CompletionScreenProps) {
  return (
    <div className="relative mt-12 flex flex-1 flex-col items-center justify-center gap-8 rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confettiPieces.map((_, index) => (
          <motion.span
            key={index}
            className="absolute h-2 w-2 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#ffb46b]"
            initial={{
              x: Math.random() * 600 - 300,
              y: -50,
              opacity: 0,
            }}
            animate={{
              y: Math.random() * 400 + 200,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              delay: Math.random() * 0.8,
              repeat: Infinity,
              repeatDelay: Math.random() * 2 + 1,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-6xl"
      >
        🎉
      </motion.div>

      <div className="space-y-3">
        <h2 className="text-3xl font-semibold">You’ve finished cooking!</h2>
        <p className="text-sm text-white/70">Enjoy your {recipeTitle}. Ready for the next meal?</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          className="rounded-full bg-white/90 px-6 py-2 text-[#1E1E1E] hover:bg-white"
        >
          <Link href={`/recipes/${recipeId}`}>Back to recipe</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-full border-white/40 px-6 py-2 text-white hover:bg-white/10"
        >
          <Link href="/meal-planner">Plan another meal</Link>
        </Button>
      </div>
    </div>
  )
}





























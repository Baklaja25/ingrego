"use client"

import { PropsWithChildren } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function BlogLayout({ children }: PropsWithChildren) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-[#FBEED7]/40 via-white to-white"
    >
      <header className="border-b border-[#FBEED7]/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-10 text-center">
          <span className="text-xs uppercase tracking-wider text-[#FF8C42]">IngreGo blog</span>
          <h1 className="text-4xl font-bold text-[#1E1E1E] sm:text-5xl">Cook better every week</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Tips, ingredient spotlights, and AI cooking inspiration from the IngreGo team.
          </p>
          <Button asChild className="mx-auto rounded-full bg-[#FF8C42] px-6 text-white hover:brightness-105">
            <Link href="/meal-planner">Plan your meals</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-12">{children}</main>
    </motion.div>
  )
}




























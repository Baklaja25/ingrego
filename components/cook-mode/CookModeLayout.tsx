"use client"

import { PropsWithChildren } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface CookModeLayoutProps extends PropsWithChildren {
  title: string
  currentStep: number
  totalSteps: number
  onExitHref?: string
  onExit?: () => void
}

export function CookModeLayout({
  title,
  currentStep,
  totalSteps,
  onExitHref = "/dashboard",
  onExit,
  children,
}: CookModeLayoutProps) {
  const progress = totalSteps > 0 ? (currentStep + 1) / totalSteps : 0

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#121212] to-[#272727] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50">Cook mode</p>
              <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
            </div>
            {onExit ? (
              <Button
                variant="outline"
                className="self-stretch rounded-full border-white/20 text-white hover:bg-white/10 sm:self-auto"
                onClick={onExit}
              >
                Exit
              </Button>
            ) : (
              <Link href={onExitHref} className="self-stretch sm:self-auto">
                <Button variant="outline" className="w-full rounded-full border-white/20 text-white">
                  Exit
                </Button>
              </Link>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#ffb46b]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress * 100, 1)}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
          <div className="text-sm text-white/60">
            Step {totalSteps === 0 ? 0 : currentStep + 1} of {totalSteps}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10">
        {children}
      </main>
    </div>
  )
}


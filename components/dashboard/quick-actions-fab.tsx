"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, ChefHat, Sparkles, CalendarDays, X } from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  {
    label: "Scan",
    description: "Scan ingredients",
    href: "/scan",
    icon: Camera,
    position: { top: "-140px", left: "0px" },
  },
  {
    label: "Recipes",
    description: "Suggest recipes",
    href: "/",
    icon: Sparkles,
    position: { top: "-100px", left: "-90px" },
  },
  {
    label: "Cook Mode",
    description: "Start cook mode",
    href: "/recipes/recipe-1",
    icon: ChefHat,
    position: { top: "-100px", right: "-90px" },
  },
  {
    label: "Planner",
    description: "Meal planner",
    href: "/meal-planner",
    icon: CalendarDays,
    position: { top: "-140px", right: "0px" },
  },
] as const

export function QuickActionsFab() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleActionClick = useCallback(
    (href: string) => {
      setIsOpen(false)
      router.push(href)
    },
    [router]
  )

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Action Cards */}
        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-16 right-0">
              {actions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 8 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    onClick={() => handleActionClick(action.href)}
                    className={cn(
                      "absolute flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-md transition-all hover:scale-105 hover:shadow-lg",
                      "focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-2"
                    )}
                    style={action.position}
                    aria-label={action.description}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF8C42]/10">
                      <Icon className="h-4 w-4 text-[#FF8C42]" />
                    </div>
                    <span className="text-sm font-medium text-[#1E1E1E]">{action.label}</span>
                  </motion.button>
                )
              })}
            </div>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <motion.button
          type="button"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
          aria-expanded={isOpen}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full bg-[#FF8C42] text-white shadow-lg shadow-orange-300/40",
            "transition-all hover:scale-110 hover:shadow-xl hover:shadow-orange-300/50",
            "focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-2 focus:ring-offset-white"
          )}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {isOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <span className="text-2xl font-light leading-none" aria-hidden="true">
                +
              </span>
            )}
          </motion.div>
        </motion.button>
      </div>
    </>
  )
}


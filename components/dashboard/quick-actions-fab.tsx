"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, ChefHat, Sparkles, CalendarDays, X } from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  {
    label: "Cook Mode",
    description: "Start cook mode",
    href: "/recipes/recipe-1",
    icon: ChefHat,
  },
  {
    label: "Scan",
    description: "Scan ingredients",
    href: "/scan",
    icon: Camera,
  },
  {
    label: "Recipes",
    description: "Suggest recipes",
    href: "/",
    icon: Sparkles,
  },
  {
    label: "Planner",
    description: "Meal planner",
    href: "/meal-planner",
    icon: CalendarDays,
  },
] as const

// Calculate positions for action circles in a semi-circle pattern
// Positioned to stay within screen bounds, especially on mobile
const getActionPosition = (index: number, total: number) => {
  // Adjust angle to spread more upward and leftward (away from screen edges)
  const angle = (index * Math.PI) / (total + 1) - Math.PI / 2 // Start from top
  const radius = 65 // Reduced radius to keep circles closer and within screen
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius - 35 // More upward offset to keep within screen
  return {
    x,
    y,
  }
}

export function QuickActionsFab() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleActionClick = useCallback(
    (href: string) => {
      setIsOpen(false)
      router.push(href)
    },
    [router]
  )

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen])

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
      <div className="fixed bottom-8 right-6 z-50">
        {/* Action Circles */}
        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-0 right-0">
              {actions.map((action, index) => {
                const Icon = action.icon
                const position = getActionPosition(index, actions.length)
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      x: position.x,
                      y: position.y,
                    }}
                    exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                    onClick={() => handleActionClick(action.href)}
                    className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-2"
                    aria-label={`${action.label}: ${action.description}`}
                  >
                    <Icon className="h-5 w-5 text-[#FF8C42]" />
                  </motion.button>
                )
              })}
            </div>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full bg-[#FF8C42] text-white shadow-lg shadow-orange-300/40 transition-shadow hover:shadow-xl hover:shadow-orange-300/50 focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-2",
            isOpen && "ring-2 ring-[#FF8C42] ring-offset-2"
          )}
          aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
          aria-expanded={isOpen}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {isOpen ? (
              <X className="h-6 w-6" strokeWidth={2.5} />
            ) : (
              <span className="text-2xl font-light leading-none">+</span>
            )}
          </motion.div>
        </motion.button>
      </div>
    </>
  )
}


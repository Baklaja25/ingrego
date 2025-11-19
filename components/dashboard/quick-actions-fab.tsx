"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, ChefHat, Sparkles, CalendarDays, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Actions arranged in full circle: Top, Top-Right, Bottom-Right, Bottom-Left
const actions = [
  {
    label: "Scan",
    description: "Scan ingredients",
    href: "/scan",
    icon: Camera,
    angle: 0, // Top (0°)
  },
  {
    label: "Recipes",
    description: "Suggest recipes",
    href: "/",
    icon: Sparkles,
    angle: 45, // Top-Right (45°)
  },
  {
    label: "Planner",
    description: "Meal planner",
    href: "/meal-planner",
    icon: CalendarDays,
    angle: 135, // Bottom-Right (135°)
  },
  {
    label: "Cook Mode",
    description: "Start cook mode",
    href: "/recipes/recipe-1",
    icon: ChefHat,
    angle: 225, // Bottom-Left (225°)
  },
] as const

// Calculate positions for action circles
const getActionPosition = (angleDegrees: number, radius: number = 100) => {
  // Convert degrees to radians
  // Subtract 90 to start from top (0° = top, 90° = right, 180° = bottom, 270° = left)
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180
  
  // Calculate x and y positions relative to center
  const x = Math.cos(angleRadians) * radius
  const y = Math.sin(angleRadians) * radius
  
  return { x, y }
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

      {/* FAB Container - Centered at bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        {/* Action Circles - Positioned relative to FAB center */}
        <AnimatePresence>
          {isOpen &&
            actions.map((action, index) => {
              const Icon = action.icon
              const position = getActionPosition(action.angle)
              return (
                <motion.button
                  key={action.label}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: position.x,
                    y: position.y,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.3,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  onClick={() => handleActionClick(action.href)}
                  className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#FF8C42]/20 shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-2"
                  style={{
                    // Position at FAB center (FAB is 56px, so center is at 28px from left/top of FAB)
                    left: "28px",
                    top: "28px",
                    // Framer Motion x/y will add offset from center
                  }}
                  aria-label={`${action.label}: ${action.description}`}
                >
                  <Icon className="h-5 w-5 text-[#FF8C42]" />
                </motion.button>
              )
            })}
        </AnimatePresence>

        {/* FAB Button */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-full bg-[#FF8C42] text-white shadow-lg shadow-orange-300/40 transition-shadow hover:shadow-xl hover:shadow-orange-300/50 focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-2",
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


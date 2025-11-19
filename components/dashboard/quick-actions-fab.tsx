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

// Calculate positions for action circles in a 150-degree arc with equal spacing
const getActionPosition = (index: number, total: number) => {
  // 150 degrees in radians = 150 * (π/180) = 2.618 radians
  const angleRangeDegrees = 150
  const angleRangeRadians = (angleRangeDegrees * Math.PI) / 180
  
  // Start from -75 degrees (center of 150-degree arc pointing upward)
  // Convert to radians: -75 * (π/180) = -1.308 radians
  const startAngleRadians = -(angleRangeRadians / 2)
  
  // Calculate angle for each circle with equal spacing
  // For 4 circles, we have 3 intervals, so spacing = angleRange / 3
  const angle = startAngleRadians + (index * angleRangeRadians) / (total - 1)
  
  // Radius for the arc
  const radius = 75
  
  // Calculate x and y positions
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  
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

      {/* FAB Container - Centered at bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        {/* Action Circles */}
        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              {actions.map((action, index) => {
                const Icon = action.icon
                const position = getActionPosition(index, actions.length)
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
                      ease: [0.34, 1.56, 0.64, 1], // Custom easing for smooth bounce
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


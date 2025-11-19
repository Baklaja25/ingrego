"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
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

// FAB position constants
const FAB_BOTTOM = 32 // bottom-8 = 32px
const FAB_SIZE = 56 // h-14 w-14 = 56px
const ACTION_RADIUS = 100 // Distance from FAB center
const ACTION_SIZE = 48 // h-12 w-12 = 48px

// Calculate viewport positions for action buttons
const getActionViewportPosition = (angleDegrees: number) => {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180
  
  // FAB center position in viewport
  const fabCenterX = typeof window !== "undefined" ? window.innerWidth / 2 : 0
  const fabCenterY = typeof window !== "undefined" ? window.innerHeight - FAB_BOTTOM - (FAB_SIZE / 2) : 0
  
  // Calculate offset from FAB center
  const offsetX = Math.cos(angleRadians) * ACTION_RADIUS
  const offsetY = Math.sin(angleRadians) * ACTION_RADIUS
  
  // Final position (center of action button)
  const x = fabCenterX + offsetX - (ACTION_SIZE / 2)
  const y = fabCenterY + offsetY - (ACTION_SIZE / 2)
  
  return { x, y }
}

export function QuickActionsFab() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

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
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Handle window resize - close menu to avoid positioning issues
  useEffect(() => {
    if (!isOpen || !mounted) return

    const handleResize = () => {
      setIsOpen(false)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen, mounted])

  if (!mounted) return null

  const actionButtons = isOpen && (
    <AnimatePresence>
      {actions.map((action, index) => {
        const Icon = action.icon
        const position = getActionViewportPosition(action.angle)
        return (
          <motion.button
            key={action.label}
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              delay: index * 0.08,
              duration: 0.3,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            onClick={() => handleActionClick(action.href)}
            className="fixed flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#FF8C42]/20 shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-2 z-50"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            aria-label={`${action.label}: ${action.description}`}
          >
            <Icon className="h-5 w-5 text-[#FF8C42]" />
          </motion.button>
        )
      })}
    </AnimatePresence>
  )

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

      {/* Action Buttons via Portal */}
      {mounted && createPortal(actionButtons, document.body)}

      {/* FAB Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF8C42] text-white shadow-lg shadow-orange-300/40 transition-shadow hover:shadow-xl hover:shadow-orange-300/50 focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-2",
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
    </>
  )
}


"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Camera, ChefHat, Sparkles, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

// Action buttons configuration - all opening upward in a semi-circle
const actions = [
  {
    label: "Scan",
    description: "Scan ingredients",
    href: "/scan",
    icon: Camera,
    translateX: 0,
    translateY: -90, // Top center
  },
  {
    label: "Recipes",
    description: "Suggest recipes",
    href: "/",
    icon: Sparkles,
    translateX: 64, // Top right (diagonal)
    translateY: -64,
  },
  {
    label: "Planner",
    description: "Meal planner",
    href: "/meal-planner",
    icon: CalendarDays,
    translateX: -64, // Top left (diagonal)
    translateY: -64,
  },
  {
    label: "Cook Mode",
    description: "Start cook mode",
    href: "/recipes/recipe-1",
    icon: ChefHat,
    translateX: -90, // Left
    translateY: 0,
  },
] as const

export function QuickAccessFAB() {
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
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* FAB Container - Fixed at bottom-center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        {/* Action Buttons */}
        <div className="absolute inset-0 pointer-events-none">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => handleActionClick(action.href)}
                className={cn(
                  "absolute left-1/2 top-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#FF8C42]/20 shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-2 pointer-events-auto",
                  // Opacity transition
                  isOpen ? "opacity-100" : "opacity-0"
                )}
                style={{
                  transform: isOpen
                    ? `translate(calc(-50% + ${action.translateX}px), calc(-50% + ${action.translateY}px)) scale(1)`
                    : "translate(-50%, -50%) scale(0)",
                  transitionDelay: isOpen ? `${index * 50}ms` : `${(actions.length - 1 - index) * 30}ms`,
                }}
                aria-label={`${action.label}: ${action.description}`}
              >
                <Icon className="h-5 w-5 text-[#FF8C42]" />
              </button>
            )
          })}
        </div>

        {/* Main FAB Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-full bg-[#FF8C42] text-white shadow-lg shadow-orange-300/40 transition-all duration-300 hover:shadow-xl hover:shadow-orange-300/50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:ring-offset-2",
            isOpen && "ring-2 ring-[#FF8C42] ring-offset-2"
          )}
          aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
          aria-expanded={isOpen}
        >
          <span
            className={cn(
              "text-2xl font-light leading-none transition-transform duration-300 ease-in-out",
              isOpen && "rotate-45"
            )}
          >
            +
          </span>
        </button>
      </div>
    </>
  )
}

// Export with both names for backward compatibility
export { QuickAccessFAB as QuickActionsFab }

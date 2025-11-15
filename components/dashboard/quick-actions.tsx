"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, ChefHat, Sparkles, CalendarDays } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface QuickActionsProps {
  className?: string
}

const actions = [
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
    label: "Cook Mode",
    description: "Start cook mode",
    href: "/recipes/recipe-1",
    icon: ChefHat,
  },
  {
    label: "Planner",
    description: "Meal planner",
    href: "/meal-planner",
    icon: CalendarDays,
  },
] as const

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      <Card className="h-full rounded-3xl border border-[#FF8C42]/10 bg-gradient-to-br from-white via-[#FFF8F2] to-[#FBEED7]/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#1E1E1E]">Quick Actions</CardTitle>
          <CardDescription className="text-sm text-[#1E1E1E]/60">
            Get started with IngreGo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            {actions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button
                  variant="outline"
                  className="flex h-20 w-full flex-col items-center justify-center rounded-xl border-[#FF8C42]/30 text-[#1E1E1E]"
                >
                  <action.icon className="mb-1 h-6 w-6 text-[#FF8C42]" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
          <div className="hidden flex-col space-y-3 sm:flex">
            {actions.map((action) => (
              <Link key={action.label} href={action.href} className="block">
                <Button
                  className="w-full justify-start rounded-xl border-[#FF8C42]/40 text-[#1E1E1E]"
                  variant="outline"
                >
                  <action.icon className="mr-3 h-4 w-4 text-[#FF8C42]" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{action.description}</span>
                    <span className="text-xs text-[#1E1E1E]/60">Quick access</span>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

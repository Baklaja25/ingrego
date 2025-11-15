"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

const FEATURES = [
  { text: "Unlimited ingredient scans", premium: true },
  { text: "Unlimited AI recipe generations", premium: true },
  { text: "Weekly Meal Planner", premium: true },
  { text: "Shopping list exports (PDF & CSV)", premium: true },
  { text: "Voice-guided Cook Mode", premium: true },
  { text: "AI Spice & Ingredient Analytics", premium: true },
  { text: "Basic recipe generation (5/month)", premium: false },
  { text: "Basic meal planner (1 week)", premium: false },
] as const

interface PremiumModalProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

export function PremiumModal({ open, onOpenChange }: PremiumModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onOpenChange(false)
    router.push("/upgrade")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden rounded-3xl border border-[#FBEED7] bg-white p-0 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] p-6 text-center text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold tracking-tight">Upgrade to Premium</DialogTitle>
              <DialogDescription className="mt-2 text-sm text-white/80">
                Unlock your full cooking assistant — from smart meal planning to AI-guided cooking.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid gap-3">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center justify-between rounded-xl border border-[#FBEED7]/70 bg-[#FBEED7]/20 px-4 py-3 text-sm transition hover:bg-[#FBEED7]/40"
                >
                  <span className="font-medium text-[#1E1E1E]">{feature.text}</span>
                  {feature.premium ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF8C42]/15 text-[#FF8C42]">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-400">
                      <Lock className="h-4 w-4" />
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FBEED7] to-transparent" />

            <div className="rounded-2xl bg-[#FBEED7]/30 px-6 py-5 text-center">
              <h3 className="text-lg font-semibold text-[#FF8C42]">Go Premium for just €6.99/month</h3>
              <p className="mt-1 text-sm text-muted-foreground">or save 30% with a yearly plan</p>

              <Button
                onClick={handleUpgrade}
                className="mt-5 h-12 w-full rounded-2xl bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] text-lg font-semibold text-white shadow-md transition hover:brightness-105"
              >
                Upgrade now
              </Button>

              <p className="mt-3 text-xs text-muted-foreground">Cancel anytime. Instant access to all features.</p>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useCookModeStore } from "@/stores/cook-mode-store"
import { cn } from "@/lib/utils"
import { Volume2, VolumeX, Pause, Play } from "lucide-react"
import { CompletionScreen } from "@/components/cook-mode/CompletionScreen"

function extractTimer(step: string): number | undefined {
  const match = step.match(/(\d+)\s*(min|mins|minute|minutes|sec|secs|second|seconds)/i)
  if (!match) return undefined
  const amount = Number(match[1])
  if (Number.isNaN(amount)) return undefined
  const unit = match[2].toLowerCase()
  if (unit.startsWith("min")) {
    return amount * 60
  }
  return amount
}

export function StepView({ recipeTitle, recipeId }: { recipeTitle: string; recipeId: string }) {
  const { steps, currentStep, setStep, timer, setTimer } = useCookModeStore()
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [countdown, setCountdown] = useState<number | undefined>(timer)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const totalSteps = steps.length
  const isCompleted = currentStep >= totalSteps
  const stepText = isCompleted ? "" : steps[currentStep] ?? "Enjoy your meal!"
  const detectedTimer = isCompleted ? undefined : extractTimer(stepText)

  useEffect(() => {
    setCountdown(timer)
  }, [timer])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel()
    }
    setSpeechEnabled(false)
  }, [stepText])

  useEffect(() => {
    const total = totalSteps || 1
    const clampedIndex = Math.min(currentStep + 1, total)
    setProgress((clampedIndex / total) * 100)
  }, [currentStep, totalSteps])

  useEffect(() => {
    if (!speechEnabled) return
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechEnabled(false)
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(`${recipeTitle}, step ${currentStep + 1}. ${stepText}`)
    utterance.onend = () => setSpeechEnabled(false)

    try {
      window.speechSynthesis.speak(utterance)
    } catch {
      setSpeechEnabled(false)
    }

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [currentStep, recipeTitle, speechEnabled, stepText])

  useEffect(() => {
    if (countdown === undefined) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }
    if (countdown <= 0) {
      setTimer(undefined)
      setCountdown(undefined)
      if (!isCompleted && currentStep < totalSteps - 1) {
        setStep(currentStep + 1)
      }
      return
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => (prev === undefined ? prev : prev - 1))
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [countdown, currentStep, isCompleted, setStep, setTimer, totalSteps])

  const handleStartTimer = useCallback(() => {
    if (!detectedTimer) return
    setTimer(detectedTimer)
    setCountdown(detectedTimer)
  }, [detectedTimer, setCountdown, setTimer])

  const handleCancelTimer = useCallback(() => {
    setTimer(undefined)
    setCountdown(undefined)
  }, [setTimer])

  const handlePrevious = useCallback(() => {
    setStep(Math.max(0, currentStep - 1))
  }, [currentStep, setStep])

  const handleNext = useCallback(() => {
    setStep(currentStep + 1)
  }, [currentStep, setStep])

  if (isCompleted) {
    return <CompletionScreen recipeId={recipeId} recipeTitle={recipeTitle} />
  }

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-white/60">
          Step {steps.length === 0 ? 0 : currentStep + 1} of {steps.length}
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (speechEnabled) {
              setSpeechEnabled(false)
              if (typeof window !== "undefined") {
                window.speechSynthesis.cancel()
              }
              return
            }
            setSpeechEnabled(true)
          }}
          className={cn(
            "rounded-full border-white/20 text-white hover:bg-white/10",
            speechEnabled && "bg-white/10"
          )}
        >
          {speechEnabled ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
          {speechEnabled ? "Stop narration" : "Read step"}
        </Button>
      </div>

      <div className="h-1.5 w-full rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#ffb46b]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(progress, 1)}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-left text-2xl leading-relaxed text-white sm:text-3xl"
      >
        {stepText}
      </motion.div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {countdown !== undefined ? (
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF8C42]/20 text-[#FF8C42]">
              <Pause className="h-3 w-3" />
            </span>
            Timer running: {Math.max(countdown, 0)}s
            <Button variant="ghost" size="sm" onClick={handleCancelTimer} className="ml-2 h-7 rounded-full text-white/70 hover:text-white">
              Cancel
            </Button>
          </div>
        ) : detectedTimer ? (
          <Button
            onClick={handleStartTimer}
            className="w-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] text-white hover:brightness-105 sm:w-auto"
          >
            <Play className="mr-2 h-4 w-4" />
            Start {detectedTimer >= 60 ? `${Math.round(detectedTimer / 60)} min` : `${detectedTimer}s`} timer
          </Button>
        ) : (
          <div className="text-sm text-white/50">No timer detected in this step.</div>
        )}

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            className="w-full rounded-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            className="w-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] text-white hover:brightness-105 sm:w-auto"
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}


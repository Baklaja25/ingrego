"use client"

import { create } from "zustand"

interface CookModeState {
  steps: string[]
  currentStep: number
  timer?: number
  setSteps: (steps: string[]) => void
  setStep: (step: number) => void
  setTimer: (seconds?: number) => void
}

export const useCookModeStore = create<CookModeState>((set) => ({
  steps: [],
  currentStep: 0,
  timer: undefined,
  setSteps: (steps) => set({ steps, currentStep: 0 }),
  setStep: (step) =>
    set((state) => {
      const upperBound = Math.max(state.steps.length, 0)
      return {
        currentStep: Math.max(0, Math.min(step, upperBound)),
      }
    }),
  setTimer: (seconds) => set({ timer: seconds }),
}))


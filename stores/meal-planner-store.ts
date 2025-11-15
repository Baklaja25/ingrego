import { create } from "zustand"
import { MealPlanData, MealSlot } from "@/src/types"
import { createEmptyMealPlanData } from "@/lib/mealPlan"

interface MealPlannerState {
  weekStart: string
  plan: MealPlanData
  setInitial: (weekStart: string, plan: MealPlanData) => void
  setWeekPlan: (weekStart: string, plan: MealPlanData) => void
  setSlot: (day: string, slot: MealSlot, recipeId: string | null) => void
  reset: (plan?: MealPlanData) => void
}

export const useMealPlannerStore = create<MealPlannerState>((set) => ({
  weekStart: new Date().toISOString(),
  plan: createEmptyMealPlanData(),
  setInitial: (weekStart, plan) =>
    set({
      weekStart,
      plan: { ...createEmptyMealPlanData(), ...plan },
    }),
  setWeekPlan: (weekStart, plan) =>
    set({
      weekStart,
      plan: { ...createEmptyMealPlanData(), ...plan },
    }),
  setSlot: (day, slot, recipeId) =>
    set((state) => {
      const nextPlan: MealPlanData = {
        ...state.plan,
        [day]: {
          ...(state.plan[day] ?? { breakfast: null, lunch: null, dinner: null }),
          [slot]: recipeId,
        },
      }
      return { plan: nextPlan }
    }),
  reset: (plan) =>
    set({
      plan: plan ? { ...createEmptyMealPlanData(), ...plan } : createEmptyMealPlanData(),
    }),
}))



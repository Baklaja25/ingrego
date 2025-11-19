import { MealPlanData, MealSlot } from "@/src/types"

export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

export const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"]

export function createEmptyMealPlanData(): MealPlanData {
  return WEEK_DAYS.reduce((acc, day) => {
    acc[day] = {
      breakfast: null,
      lunch: null,
      dinner: null,
    }
    return acc
  }, {} as MealPlanData)
}

export function normalizeMealPlanData(input: any): MealPlanData {
  const result = createEmptyMealPlanData()

  if (!input || typeof input !== "object") {
    return result
  }

  for (const day of WEEK_DAYS) {
    const dayPlan = input[day]
    if (dayPlan && typeof dayPlan === "object") {
      for (const slot of MEAL_SLOTS) {
        const value = dayPlan[slot]
        result[day][slot] = typeof value === "string" && value.trim().length > 0 ? value : null
      }
    }
  }

  return result
}


























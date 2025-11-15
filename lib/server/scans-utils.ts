import { z } from "zod"

export const saveScanSchema = z.object({
  imageUrl: z.string().trim().optional(),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
})

export function sanitizeIngredients(ingredients: string[]) {
  return ingredients.map((ingredient) => ingredient.trim()).filter(Boolean)
}


















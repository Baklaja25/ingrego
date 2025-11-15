export function normalizeIngredients(ingredients: string[]): string {
  return ingredients
    .map((ingredient) => ingredient.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join(",")
}




import { describe, expect, it } from "@jest/globals"
import { normalizeIngredients } from "../normalizeIngredients"

describe("normalizeIngredients", () => {
  it("lowercases, trims, and sorts ingredients", () => {
    const result = normalizeIngredients(["  Tomato ", "Basil", "garlic "])
    expect(result).toBe("basil,garlic,tomato")
  })

  it("filters out empty or whitespace-only values", () => {
    const result = normalizeIngredients(["Onion", " ", "", "Pepper"])
    expect(result).toBe("onion,pepper")
  })
})




















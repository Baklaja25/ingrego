import { describe, expect, it } from "@jest/globals"
import { saveScanSchema, sanitizeIngredients } from "@/lib/server/scans-utils"

describe("POST /api/scans validation", () => {
  it("accepts a valid payload", () => {
    const payload = {
      imageUrl: "https://example.com/image.jpg",
      ingredients: ["Tomato", " Basil ", "GARLIC"],
    }

    const result = saveScanSchema.safeParse(payload)
    expect(result.success).toBe(true)
  })

  it("rejects payloads without ingredients", () => {
    const payload = {
      imageUrl: "https://example.com/image.jpg",
      ingredients: [] as string[],
    }

    const result = saveScanSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it("sanitizes ingredient list", () => {
    const sanitized = sanitizeIngredients(["  Onion  ", " ", "", "Pepper"])
    expect(sanitized).toEqual(["Onion", "Pepper"])
  })
})





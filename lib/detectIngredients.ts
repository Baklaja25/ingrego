/**
 * Client helper to detect ingredients from an image
 * Note: Only imageBase64 is supported for security reasons (SSRF protection)
 */
export async function detectIngredients({
  imageBase64,
}: {
  imageBase64: string
}): Promise<string[]> {
  try {
    if (!imageBase64) {
      throw new Error("imageBase64 is required")
    }

    const response = await fetch("/api/scan/ingredients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to detect ingredients")
    }

    return data.ingredients || []
  } catch (error: any) {
    console.error("detectIngredients error:", error)
    throw error
  }
}



/**
 * Client helper to detect ingredients from an image
 */
export async function detectIngredients({
  imageUrl,
  imageBase64,
}: {
  imageUrl?: string
  imageBase64?: string
}): Promise<string[]> {
  try {
    const response = await fetch("/api/scan/ingredients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(imageUrl && { imageUrl }),
        ...(imageBase64 && { imageBase64 }),
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



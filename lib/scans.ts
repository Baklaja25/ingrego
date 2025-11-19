import { Recipe } from "@/lib/generateRecipes"

export type ScanItem = {
  id: string
  createdAt: string
  imageUrl?: string
  ingredients: string[]
  cacheKey: string
}

async function handleResponse<T>(res: Response, defaultError: string): Promise<T> {
  if (!res.ok) {
    let message = defaultError
    try {
      const data = await res.json()
      if (data?.error) {
        message = data.error
      }
    } catch (error) {
      // ignore JSON parsing errors
    }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export async function saveScan(input: { imageUrl?: string; ingredients: string[] }) {
  const res = await fetch("/api/scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  return handleResponse<{ id: string; createdAt: string }>(res, "Failed to save scan")
}

export async function getScans(limit = 10, cursor?: string) {
  const url = new URL("/api/scans", window.location.origin)
  url.searchParams.set("limit", String(limit))
  if (cursor) {
    url.searchParams.set("cursor", cursor)
  }

  const res = await fetch(url.toString(), { method: "GET" })

  return handleResponse<{ items: ScanItem[]; nextCursor?: string }>(res, "Failed to load scans")
}

export async function regenerateFromScan(scanId: string) {
  const res = await fetch("/api/scans/regenerate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scanId }),
  })

  return handleResponse<{ recipes: Recipe[] }>(res, "Failed to regenerate recipes")
}


























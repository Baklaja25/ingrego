import { create } from "zustand"

interface ScanStore {
  ingredients: string[]
  imageUrl: string | null
  capturedImage: string | null
  addIngredient: (name: string) => void
  removeIngredient: (name: string) => void
  setIngredients: (names: string[]) => void
  setImageUrl: (url: string | null) => void
  setCapturedImage: (image: string | null) => void
  reset: () => void
}

export const useScanStore = create<ScanStore>((set) => ({
  ingredients: [],
  imageUrl: null,
  capturedImage: null,
  addIngredient: (name) =>
    set((state) => {
      const trimmed = name.trim().toLowerCase()
      if (trimmed && !state.ingredients.includes(trimmed)) {
        return { ingredients: [...state.ingredients, trimmed] }
      }
      return state
    }),
  removeIngredient: (name) =>
    set((state) => ({
      ingredients: state.ingredients.filter((ing) => ing !== name),
    })),
  setIngredients: (names) => set({ ingredients: names }),
  setImageUrl: (url) => set({ imageUrl: url }),
  setCapturedImage: (image) => set({ capturedImage: image }),
  reset: () =>
    set({
      ingredients: [],
      imageUrl: null,
      capturedImage: null,
    }),
}))



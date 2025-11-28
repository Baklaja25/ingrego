import { prisma } from "../lib/prisma"

async function clearRecipeCache() {
  try {
    console.log("🗑️  Clearing RecipeCache...")
    
    const result = await prisma.recipeCache.deleteMany({})
    
    console.log(`✅ Successfully deleted ${result.count} cache entries`)
    console.log("✨ RecipeCache is now empty. New cache entries will be created with diet information.")
  } catch (error) {
    console.error("❌ Error clearing RecipeCache:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

clearRecipeCache()


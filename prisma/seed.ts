import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { normalizeIngredients } from "../lib/normalizeIngredients"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("demo123", 10)

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@ingrego.app" },
    update: {},
    create: {
      email: "demo@ingrego.app",
      name: "Demo User",
      password: hashedPassword,
    },
  })

  console.log("Seeded demo user:", demoUser)

  // Create 3 recipes
  const recipe1 = await prisma.recipe.upsert({
    where: { id: "recipe-1" },
    update: {},
    create: {
      id: "recipe-1",
      title: "Seafood Spaghetti",
      image: "/images/dish-sea-food-spageti.png",
      timeMins: 25,
      servings: 3,
      tags: JSON.stringify(["seafood", "pasta", "italian"]),
      calories: 450,
      rating: 4.5,
      description: "Rich tomato sauce with fresh seafood",
      ingredients: JSON.stringify(["spaghetti", "shrimp", "mussels", "tomatoes", "garlic", "olive oil"]),
      instructions: JSON.stringify([
        "Cook spaghetti according to package directions",
        "Sauté garlic in olive oil",
        "Add tomatoes and seafood",
        "Toss with pasta and serve"
      ]),
    },
  })

  const recipe2 = await prisma.recipe.upsert({
    where: { id: "recipe-2" },
    update: {},
    create: {
      id: "recipe-2",
      title: "Poke Bowl",
      image: "/images/poke-bowl.png",
      timeMins: 15,
      servings: 2,
      tags: JSON.stringify(["healthy", "fish", "bowl"]),
      calories: 380,
      rating: 4.8,
      description: "Fresh salmon with colorful vegetables",
      ingredients: JSON.stringify(["salmon", "rice", "avocado", "cucumber", "carrots", "soy sauce"]),
      instructions: JSON.stringify([
        "Cook rice and let cool",
        "Cube fresh salmon",
        "Slice vegetables",
        "Arrange in bowl and drizzle with sauce"
      ]),
    },
  })

  const recipe3 = await prisma.recipe.upsert({
    where: { id: "recipe-3" },
    update: {},
    create: {
      id: "recipe-3",
      title: "Chicken & Broccoli Bowl",
      image: "/images/white-meed-brocoli.png",
      timeMins: 35,
      servings: 1,
      tags: JSON.stringify(["chicken", "vegetables", "healthy"]),
      calories: 420,
      rating: 4.3,
      description: "Grilled chicken with roasted vegetables",
      ingredients: JSON.stringify(["chicken breast", "broccoli", "carrots", "rice", "soy sauce", "ginger"]),
      instructions: JSON.stringify([
        "Marinate chicken in soy sauce and ginger",
        "Grill chicken until cooked through",
        "Roast broccoli and carrots",
        "Serve over rice"
      ]),
    },
  })

  console.log("Seeded recipes:", { recipe1, recipe2, recipe3 })

  // Save first recipe for demo user
  await prisma.userRecipe.upsert({
    where: {
      userId_recipeId: {
        userId: demoUser.id,
        recipeId: recipe1.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      recipeId: recipe1.id,
    },
  })

  // Create 2 scans for demo user
  const scan1Ingredients = ["spaghetti", "shrimp", "tomatoes", "garlic"]
  const scan1CacheKey = normalizeIngredients(scan1Ingredients)
  const scan1 = await prisma.scan.create({
    data: {
      userId: demoUser.id,
      imageUrl: "/images/dish-sea-food-spageti.png",
      ingredientsCSV: scan1CacheKey,
      ingredientsJSON: JSON.stringify(scan1Ingredients),
      cacheKey: scan1CacheKey,
    },
  })

  const scan2Ingredients = ["salmon", "rice", "avocado", "cucumber"]
  const scan2CacheKey = normalizeIngredients(scan2Ingredients)
  const scan2 = await prisma.scan.create({
    data: {
      userId: demoUser.id,
      imageUrl: "/images/poke-bowl.png",
      ingredientsCSV: scan2CacheKey,
      ingredientsJSON: JSON.stringify(scan2Ingredients),
      cacheKey: scan2CacheKey,
    },
  })

  console.log("Seeded scans:", { scan1, scan2 })

  // Create a meal plan for this week
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)) // Monday
  weekStart.setHours(0, 0, 0, 0)

  const mealPlan = await prisma.mealPlan.upsert({
    where: { id: "mealplan-1" },
    update: {},
    create: {
      id: "mealplan-1",
      userId: demoUser.id,
      weekStart,
      data: JSON.stringify({
        monday: { breakfast: recipe1.id, lunch: recipe2.id, dinner: recipe3.id },
        tuesday: { breakfast: recipe2.id, lunch: recipe1.id },
        wednesday: { dinner: recipe3.id },
      }),
    },
  })

  console.log("Seeded meal plan:", mealPlan)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })



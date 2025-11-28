import { prisma } from "../lib/prisma"

async function verifyRLS() {
  try {
    console.log("🔒 Verifying RLS status on MealPlan table...\n")
    
    // Check if RLS is enabled
    const result = await prisma.$queryRaw<Array<{ rowsecurity: boolean }>>`
      SELECT rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'MealPlan'
    `
    
    if (result.length === 0) {
      console.error("❌ MealPlan table not found")
      return
    }
    
    const isRLSEnabled = result[0]?.rowsecurity
    
    if (isRLSEnabled) {
      console.log("✅ RLS is ENABLED on MealPlan table")
    } else {
      console.log("❌ RLS is NOT enabled on MealPlan table")
      console.log("\nTo enable RLS, run:")
      console.log('  ALTER TABLE "MealPlan" ENABLE ROW LEVEL SECURITY;')
      console.log("\nOr deploy the migration:")
      console.log("  npm run db:migrate:deploy")
    }
    
    // Check policies
    const policies = await prisma.$queryRaw<Array<{ policyname: string; cmd: string }>>`
      SELECT policyname, cmd
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'MealPlan'
      ORDER BY policyname
    `
    
    console.log(`\n📋 Found ${policies.length} RLS policies:`)
    if (policies.length === 0) {
      console.warn("⚠️  No RLS policies found. Policies need to be created in Supabase Dashboard.")
    } else {
      policies.forEach(p => {
        console.log(`   - ${p.policyname} (${p.cmd})`)
      })
    }
    
    console.log("\n💡 Note: Prisma Client with service role key bypasses RLS.")
    console.log("   Your application-level security (session checks) still applies.")
    
  } catch (error: any) {
    console.error("❌ Error verifying RLS:", error.message)
    if (error.message?.includes("permission denied")) {
      console.error("\n⚠️  Permission denied. Make sure you're using the correct database connection.")
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyRLS()


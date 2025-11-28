import { prisma } from "../lib/prisma"

async function enableRLSMealPlan() {
  try {
    console.log("🔒 Enabling RLS on MealPlan table...\n")
    
    // Check current RLS status
    const currentStatus = await prisma.$queryRaw<Array<{ rowsecurity: boolean }>>`
      SELECT rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'MealPlan'
    `
    
    if (currentStatus.length === 0) {
      console.error("❌ MealPlan table not found")
      return
    }
    
    if (currentStatus[0]?.rowsecurity) {
      console.log("✅ RLS is already enabled on MealPlan table")
      return
    }
    
    // Enable RLS
    await prisma.$executeRaw`ALTER TABLE "MealPlan" ENABLE ROW LEVEL SECURITY`
    
    console.log("✅ RLS enabled successfully on MealPlan table")
    
    // Verify
    const newStatus = await prisma.$queryRaw<Array<{ rowsecurity: boolean }>>`
      SELECT rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'MealPlan'
    `
    
    if (newStatus[0]?.rowsecurity) {
      console.log("✅ Verification: RLS is now enabled")
    } else {
      console.warn("⚠️  Warning: RLS status check failed after enabling")
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
      console.warn("⚠️  No RLS policies found. Make sure policies are created in Supabase Dashboard.")
    } else {
      policies.forEach(p => {
        console.log(`   - ${p.policyname} (${p.cmd})`)
      })
    }
    
    console.log("\n💡 Note: Prisma Client with service role key bypasses RLS.")
    console.log("   Your application-level security (session checks) still applies.")
    
  } catch (error: any) {
    console.error("❌ Error enabling RLS:", error.message)
    if (error.message?.includes("permission denied")) {
      console.error("\n⚠️  Permission denied. You may need to run this in Supabase SQL Editor:")
      console.error('   ALTER TABLE "MealPlan" ENABLE ROW LEVEL SECURITY;')
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

enableRLSMealPlan()


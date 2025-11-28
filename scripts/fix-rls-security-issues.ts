import { prisma } from "../lib/prisma"

// Tables that need RLS enabled based on Supabase linter
const tablesToEnableRLS = [
  "Scan",           // Has policies but RLS disabled
  "UserRecipe",     // Has policies but RLS disabled
  "Recipe",          // Public table without RLS
  "User",           // Public table without RLS
  "VerificationToken" // Public table without RLS
]

async function fixRLSSecurityIssues() {
  try {
    console.log("🔒 Fixing RLS security issues...\n")
    
    // Check current status
    console.log("📊 Checking current RLS status:\n")
    
    for (const tableName of tablesToEnableRLS) {
      try {
        const result = await prisma.$queryRaw<Array<{ rowsecurity: boolean; policy_count: number }>>`
          SELECT 
            COALESCE(t.rowsecurity, false) as rowsecurity,
            COALESCE(p.policy_count, 0)::int as policy_count
          FROM pg_tables t
          LEFT JOIN (
            SELECT tablename, COUNT(*)::int as policy_count
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = ${tableName}
            GROUP BY tablename
          ) p ON t.tablename = p.tablename
          WHERE t.schemaname = 'public' AND t.tablename = ${tableName}
        `
        
        if (result.length > 0) {
          const { rowsecurity, policy_count } = result[0]
          const status = rowsecurity ? "✅ ENABLED" : "❌ DISABLED"
          console.log(`${status} - ${tableName} (${policy_count} policies)`)
        } else {
          console.log(`⚠️  ${tableName} - Table not found`)
        }
      } catch (error: any) {
        console.error(`❌ Error checking ${tableName}:`, error.message)
      }
    }
    
    // Enable RLS on all tables
    console.log("\n🔧 Enabling RLS on tables...\n")
    
    for (const tableName of tablesToEnableRLS) {
      try {
        // Check if RLS is already enabled
        const checkResult = await prisma.$queryRaw<Array<{ rowsecurity: boolean }>>`
          SELECT COALESCE(rowsecurity, false) as rowsecurity
          FROM pg_tables
          WHERE schemaname = 'public' AND tablename = ${tableName}
        `
        
        if (checkResult.length > 0 && checkResult[0].rowsecurity) {
          console.log(`✅ ${tableName}: RLS already enabled`)
          continue
        }
        
        // Enable RLS
        await prisma.$executeRawUnsafe(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY`)
        console.log(`✅ Enabled RLS on ${tableName}`)
      } catch (error: any) {
        console.error(`❌ Failed to enable RLS on ${tableName}:`, error.message)
      }
    }
    
    // Final verification
    console.log("\n📋 Final RLS Status:\n")
    
    for (const tableName of tablesToEnableRLS) {
      try {
        const result = await prisma.$queryRaw<Array<{ rowsecurity: boolean; policy_count: number }>>`
          SELECT 
            COALESCE(t.rowsecurity, false) as rowsecurity,
            COALESCE(p.policy_count, 0)::int as policy_count
          FROM pg_tables t
          LEFT JOIN (
            SELECT tablename, COUNT(*)::int as policy_count
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = ${tableName}
            GROUP BY tablename
          ) p ON t.tablename = p.tablename
          WHERE t.schemaname = 'public' AND t.tablename = ${tableName}
        `
        
        if (result.length > 0) {
          const { rowsecurity, policy_count } = result[0]
          const status = rowsecurity ? "✅ ENABLED" : "❌ DISABLED"
          console.log(`${status} - ${tableName} (${policy_count} policies)`)
        }
      } catch (error: any) {
        console.error(`❌ Error verifying ${tableName}:`, error.message)
      }
    }
    
    console.log("\n💡 Note: Prisma Client with service role key bypasses RLS.")
    console.log("   Your application-level security (session checks) still applies.")
    console.log("\n✅ All security issues should now be resolved!")
    
  } catch (error: any) {
    console.error("❌ Error:", error.message)
    if (error.message?.includes("permission denied")) {
      console.error("\n⚠️  Permission denied. You may need to run this in Supabase SQL Editor.")
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixRLSSecurityIssues()


import { prisma } from "../lib/prisma"


async function enableRLSAllTables() {
  try {
    console.log("🔒 Checking RLS status on all tables in public schema...\n")
    
    // Get all tables in public schema with their RLS status
    const tables = await prisma.$queryRaw<Array<{ tablename: string; rowsecurity: boolean; policy_count: number }>>`
      SELECT 
        t.tablename,
        COALESCE(t.rowsecurity, false) as rowsecurity,
        COALESCE(p.policy_count, 0)::int as policy_count
      FROM pg_tables t
      LEFT JOIN (
        SELECT tablename, COUNT(*)::int as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY tablename
      ) p ON t.tablename = p.tablename
      WHERE t.schemaname = 'public'
        AND t.tablename NOT LIKE 'pg_%'
        AND t.tablename NOT LIKE '_prisma%'
      ORDER BY t.tablename
    `
    
    console.log(`📊 Found ${tables.length} tables in public schema:\n`)
    
    const tablesNeedingRLS: string[] = []
    const tablesWithPoliciesButNoRLS: string[] = []
    
    for (const table of tables) {
      const hasRLS = table.rowsecurity
      const hasPolicies = table.policyCount > 0
      
      if (hasPolicies && !hasRLS) {
        tablesWithPoliciesButNoRLS.push(table.tablename)
        console.log(`❌ ${table.tablename}: Has ${table.policyCount} policies but RLS is DISABLED`)
      } else if (!hasRLS) {
        tablesNeedingRLS.push(table.tablename)
        console.log(`⚠️  ${table.tablename}: RLS is DISABLED (${table.policyCount} policies)`)
      } else {
        console.log(`✅ ${table.tablename}: RLS is ENABLED (${table.policyCount} policies)`)
      }
    }
    
    // Enable RLS on tables that have policies but RLS is disabled (HIGH PRIORITY)
    if (tablesWithPoliciesButNoRLS.length > 0) {
      console.log(`\n🔧 Enabling RLS on ${tablesWithPoliciesButNoRLS.length} tables with policies but RLS disabled...\n`)
      
      for (const tableName of tablesWithPoliciesButNoRLS) {
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY`)
          console.log(`✅ Enabled RLS on ${tableName}`)
        } catch (error: any) {
          console.error(`❌ Failed to enable RLS on ${tableName}:`, error.message)
        }
      }
    }
    
    // Optionally enable RLS on other tables (lower priority)
    if (tablesNeedingRLS.length > 0) {
      console.log(`\n⚠️  ${tablesNeedingRLS.length} tables without RLS (no policies defined):`)
      tablesNeedingRLS.forEach(t => console.log(`   - ${t}`))
      console.log("\n💡 These tables don't have RLS policies. Consider:")
      console.log("   1. Creating RLS policies in Supabase Dashboard")
      console.log("   2. Or enabling RLS manually if policies are not needed")
    }
    
    // Final verification
    console.log("\n📋 Final RLS Status:\n")
    const finalStatus = await prisma.$queryRaw<Array<{ tablename: string; rowsecurity: boolean; policy_count: number }>>`
      SELECT 
        t.tablename,
        COALESCE(t.rowsecurity, false) as rowsecurity,
        COALESCE(p.policy_count, 0)::int as policy_count
      FROM pg_tables t
      LEFT JOIN (
        SELECT tablename, COUNT(*)::int as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY tablename
      ) p ON t.tablename = p.tablename
      WHERE t.schemaname = 'public'
        AND t.tablename NOT LIKE 'pg_%'
        AND t.tablename NOT LIKE '_prisma%'
      ORDER BY t.tablename
    `
    
    for (const table of finalStatus) {
      const status = table.rowsecurity ? "✅ ENABLED" : "❌ DISABLED"
      console.log(`${status} - ${table.tablename} (${table.policyCount} policies)`)
    }
    
    console.log("\n💡 Note: Prisma Client with service role key bypasses RLS.")
    console.log("   Your application-level security (session checks) still applies.")
    
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

enableRLSAllTables()


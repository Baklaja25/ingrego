import { prisma } from "../lib/prisma"

async function fixFunctionSearchPath() {
  try {
    console.log("🔒 Fixing function search_path security issues...\n")
    
    // Function that needs to be fixed
    const functionName = "recipecache_set_updated_at"
    
    // Check if function exists
    const functionExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = ${functionName}
      ) as exists
    `
    
    if (!functionExists[0]?.exists) {
      console.log(`⚠️  Function ${functionName} not found. It may have been removed or renamed.`)
      return
    }
    
    // Get current function definition
    const currentDef = await prisma.$queryRaw<Array<{ definition: string }>>`
      SELECT pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = ${functionName}
    `
    
    if (currentDef.length === 0) {
      console.log(`⚠️  Could not retrieve function definition for ${functionName}`)
      return
    }
    
    console.log(`📋 Current function: ${functionName}`)
    console.log(`\n🔧 Fixing search_path...\n`)
    
    // Drop and recreate function with fixed search_path
    // This is a trigger function that sets updatedAt timestamp
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.recipecache_set_updated_at()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''
      AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$;
    `)
    
    console.log(`✅ Fixed search_path for ${functionName}`)
    
    // Verify the fix by checking function properties
    const verifyProps = await prisma.$queryRaw<Array<{ proconfig: string[] }>>`
      SELECT proconfig
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = ${functionName}
    `
    
    if (verifyProps.length > 0) {
      const config = verifyProps[0].proconfig || []
      const hasSearchPath = config.some((setting: string) => setting.startsWith('search_path='))
      
      if (hasSearchPath) {
        console.log(`✅ Verification: Function now has fixed search_path`)
        const searchPathSetting = config.find((s: string) => s.startsWith('search_path='))
        console.log(`   Setting: ${searchPathSetting}`)
      } else {
        console.warn(`⚠️  Warning: Could not verify search_path fix`)
      }
    } else {
      console.warn(`⚠️  Warning: Could not retrieve function properties`)
    }
    
    console.log("\n💡 Note: Setting search_path to empty string prevents SQL injection")
    console.log("   by ensuring functions only use fully qualified names.")
    
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

fixFunctionSearchPath()


import { prisma } from "../lib/prisma"

interface TablePolicy {
  tableName: string
  policies: {
    name: string
    operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE"
    definition: string
  }[]
}

// Define policies for tables that need them
const tablePolicies: TablePolicy[] = [
  {
    tableName: "Recipe",
    policies: [
      {
        name: "Recipe select public",
        operation: "SELECT",
        definition: "true", // Public read access for recipes
      },
      {
        name: "Recipe insert authenticated",
        operation: "INSERT",
        definition: "auth.role() = 'authenticated'", // Only authenticated users can insert
      },
      {
        name: "Recipe update authenticated",
        operation: "UPDATE",
        definition: "auth.role() = 'authenticated'", // Only authenticated users can update
      },
      {
        name: "Recipe delete authenticated",
        operation: "DELETE",
        definition: "auth.role() = 'authenticated'", // Only authenticated users can delete
      },
    ],
  },
  {
    tableName: "User",
    policies: [
      {
        name: "User select own",
        operation: "SELECT",
        definition: "auth.uid()::text = id", // Users can only see their own data
      },
      {
        name: "User update own",
        operation: "UPDATE",
        definition: "auth.uid()::text = id", // Users can only update their own data
      },
      // Note: INSERT and DELETE are typically handled by auth system, not users directly
    ],
  },
  {
    tableName: "VerificationToken",
    policies: [
      {
        name: "VerificationToken select service",
        operation: "SELECT",
        definition: "auth.role() = 'service_role'", // Only service role can read
      },
      {
        name: "VerificationToken insert service",
        operation: "INSERT",
        definition: "auth.role() = 'service_role'", // Only service role can insert
      },
      {
        name: "VerificationToken delete service",
        operation: "DELETE",
        definition: "auth.role() = 'service_role'", // Only service role can delete
      },
      // Note: UPDATE is typically not needed for verification tokens
    ],
  },
]

async function createMissingRLSPolicies() {
  try {
    console.log("🔒 Creating missing RLS policies...\n")

    for (const tablePolicy of tablePolicies) {
      const { tableName, policies } = tablePolicy

      // Check if table has RLS enabled
      const rlsStatus = await prisma.$queryRaw<Array<{ rowsecurity: boolean }>>`
        SELECT COALESCE(rowsecurity, false) as rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = ${tableName}
      `

      if (rlsStatus.length === 0) {
        console.log(`⚠️  Table ${tableName} not found, skipping...`)
        continue
      }

      if (!rlsStatus[0].rowsecurity) {
        console.log(`⚠️  Table ${tableName} does not have RLS enabled, skipping...`)
        continue
      }

      // Check existing policies
      const existingPolicies = await prisma.$queryRaw<Array<{ policyname: string }>>`
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = ${tableName}
      `

      const existingPolicyNames = existingPolicies.map((p) => p.policyname)

      console.log(`📋 Table: ${tableName}`)
      console.log(`   Existing policies: ${existingPolicyNames.length}`)

      // Create missing policies
      for (const policy of policies) {
        if (existingPolicyNames.includes(policy.name)) {
          console.log(`   ⏭️  Policy "${policy.name}" already exists, skipping...`)
          continue
        }

        try {
          let sql = `CREATE POLICY "${policy.name}" ON "${tableName}"`
          
          switch (policy.operation) {
            case "SELECT":
              sql += ` FOR SELECT USING (${policy.definition})`
              break
            case "INSERT":
              sql += ` FOR INSERT WITH CHECK (${policy.definition})`
              break
            case "UPDATE":
              sql += ` FOR UPDATE USING (${policy.definition}) WITH CHECK (${policy.definition})`
              break
            case "DELETE":
              sql += ` FOR DELETE USING (${policy.definition})`
              break
          }

          await prisma.$executeRawUnsafe(sql)
          console.log(`   ✅ Created policy "${policy.name}" (${policy.operation})`)
        } catch (error: any) {
          console.error(`   ❌ Failed to create policy "${policy.name}":`, error.message)
        }
      }

      console.log("")
    }

    // Final summary
    console.log("📊 Final Policy Summary:\n")

    for (const tablePolicy of tablePolicies) {
      const policies = await prisma.$queryRaw<Array<{ policyname: string; cmd: string }>>`
        SELECT policyname, cmd
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = ${tablePolicy.tableName}
        ORDER BY policyname
      `

      console.log(`${tablePolicy.tableName}: ${policies.length} policies`)
      policies.forEach((p) => {
        console.log(`   - ${p.policyname} (${p.cmd})`)
      })
      console.log("")
    }

    console.log("💡 Note: Prisma Client with service role key bypasses RLS.")
    console.log("   Your application-level security (session checks) still applies.")
    console.log("\n✅ Missing RLS policies have been created!")

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

createMissingRLSPolicies()


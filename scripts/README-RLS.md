# Row-Level Security (RLS) Management

## Overview

Row-Level Security (RLS) is enabled on the `MealPlan` table in Supabase to provide an additional layer of security. This ensures that users can only access their own meal plans.

## Important Notes

⚠️ **Prisma Client with service role key bypasses RLS**

- Your application uses Prisma Client with a service role connection string
- Service role connections bypass RLS policies
- **Application-level security is still enforced** - all API routes check `session.user.id`
- RLS provides additional protection for direct SQL queries and future integrations

## Available Scripts

### Enable RLS

```bash
npm run rls:enable
```

Enables Row-Level Security on the `MealPlan` table. This script:
- Checks current RLS status
- Enables RLS if not already enabled
- Verifies the change
- Lists all RLS policies

### Verify RLS Status

```bash
npm run rls:verify
```

Verifies that RLS is enabled and lists all active policies.

## RLS Policies

The following policies are defined on the `MealPlan` table:

- **MealPlan select owner** - Users can only SELECT their own meal plans
- **MealPlan insert owner** - Users can only INSERT meal plans with their own userId
- **MealPlan update owner** - Users can only UPDATE their own meal plans
- **MealPlan delete owner** - Users can only DELETE their own meal plans

## Manual SQL (Supabase Dashboard)

If you need to enable RLS manually in Supabase SQL Editor:

```sql
ALTER TABLE "MealPlan" ENABLE ROW LEVEL SECURITY;
```

## Migration

A Prisma migration is available at:
`prisma/migrations/20251128213611_enable_rls_mealplan/migration.sql`

To apply it:
```bash
npm run db:migrate:deploy
```

Note: If you get a "database schema is not empty" error, use the `rls:enable` script instead.


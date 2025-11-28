# Row-Level Security (RLS) Management

## Overview

Row-Level Security (RLS) is enabled on multiple tables in Supabase to provide an additional layer of security. This ensures that users can only access their own data.

## Tables with RLS Enabled

- **MealPlan** - User meal plans (4 policies)
- **Scan** - User ingredient scans (4 policies)
- **UserRecipe** - User saved recipes (4 policies)
- **Recipe** - Recipe data (RLS enabled, policies may be added)
- **User** - User accounts (RLS enabled, policies may be added)
- **VerificationToken** - Email verification tokens (RLS enabled, policies may be added)

## Important Notes

⚠️ **Prisma Client with service role key bypasses RLS**

- Your application uses Prisma Client with a service role connection string
- Service role connections bypass RLS policies
- **Application-level security is still enforced** - all API routes check `session.user.id`
- RLS provides additional protection for direct SQL queries and future integrations

## Available Scripts

### Fix All RLS Security Issues

```bash
npm run rls:fix
```

**Recommended for fixing Supabase linter issues.** This script:
- Enables RLS on all tables that need it (Scan, UserRecipe, Recipe, User, VerificationToken)
- Fixes "Policy Exists RLS Disabled" errors
- Fixes "RLS Disabled in Public" errors
- Verifies the changes

### Enable RLS on Specific Table

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

Verifies that RLS is enabled on `MealPlan` and lists all active policies.

### Check All Tables

```bash
npm run rls:enable-all
```

Checks RLS status on all tables in the public schema and enables RLS on tables that have policies but RLS is disabled.

## RLS Policies

### Tables with Policies

**MealPlan** (4 policies):
- MealPlan select owner - Users can only SELECT their own meal plans
- MealPlan insert owner - Users can only INSERT meal plans with their own userId
- MealPlan update owner - Users can only UPDATE their own meal plans
- MealPlan delete owner - Users can only DELETE their own meal plans

**Scan** (4 policies):
- Scan select owner - Users can only SELECT their own scans
- Scan insert owner - Users can only INSERT scans with their own userId
- Scan update owner - Users can only UPDATE their own scans
- Scan delete owner - Users can only DELETE their own scans

**UserRecipe** (4 policies):
- UserRecipe select owner - Users can only SELECT their own saved recipes
- UserRecipe insert owner - Users can only INSERT saved recipes with their own userId
- UserRecipe update owner - Users can only UPDATE their own saved recipes
- UserRecipe delete owner - Users can only DELETE their own saved recipes

### Tables with RLS Enabled (No Policies Yet)

- **Recipe** - Public recipe data (RLS enabled for future policy implementation)
- **User** - User accounts (RLS enabled for future policy implementation)
- **VerificationToken** - Email verification tokens (RLS enabled for future policy implementation)

## Function Search Path Security

### Fix Function Search Path

```bash
npm run security:fix-function
```

Fixes the `recipecache_set_updated_at` function to have a fixed `search_path`, preventing SQL injection attacks.

## Manual SQL (Supabase Dashboard)

If you need to enable RLS manually in Supabase SQL Editor:

```sql
ALTER TABLE "MealPlan" ENABLE ROW LEVEL SECURITY;
```

To fix function search_path:

```sql
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
```

## Migration

A Prisma migration is available at:
`prisma/migrations/20251128213611_enable_rls_mealplan/migration.sql`

To apply it:
```bash
npm run db:migrate:deploy
```

Note: If you get a "database schema is not empty" error, use the `rls:enable` script instead.


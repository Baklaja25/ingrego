# Database Setup Guide for Supabase

Your Supabase project is configured at: `https://bmhyvwbjljfpuqhggbsy.supabase.co`

## Step 1: Get Your Database Password

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bmhyvwbjljfpuqhggbsy
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string** section
4. If you haven't set a database password yet, click **Reset database password** and save it securely

## Step 2: Create `.env` File

Create a `.env` file in the root of your project with the following variables:

```env
# Database Configuration (Supabase)
# Replace [YOUR_PASSWORD] with your actual database password from Step 1

# Connection Pooler URL (for transactions)
# Port: 6543 (pooler)
DATABASE_URL="postgresql://postgres.bmhyvwbjljfpuqhggbsy:[YOUR_PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection URL (for migrations)
# Port: 5432 (direct)
DIRECT_URL="postgresql://postgres.bmhyvwbjljfpuqhggbsy:[YOUR_PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional: OpenAI API Key (for recipe generation)
OPENAI_API_KEY=""
```

## Step 3: Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and replace `your-secret-key-here-generate-with-openssl-rand-base64-32` in your `.env` file.

## Step 4: Test the Connection

After setting up your `.env` file:

1. Generate Prisma Client:
   ```bash
   npm run db:generate
   ```

2. Push the schema to your database:
   ```bash
   npm run db:push
   ```

   Or run migrations:
   ```bash
   npm run db:migrate
   ```

## Important Notes

- **Never commit your `.env` file to version control** - it contains sensitive credentials
- The `.env` file should already be in `.gitignore`
- `DATABASE_URL` uses port **6543** (connection pooler) - for regular queries
- `DIRECT_URL` uses port **5432** (direct connection) - for migrations and schema operations
- Replace `[YOUR_PASSWORD]` with your actual database password from Supabase dashboard

## Troubleshooting

If you still get connection errors:

1. **Verify your password**: Make sure you're using the correct database password (not your Supabase account password)
2. **Check the connection string format**: Ensure there are no extra spaces or quotes issues
3. **Test connection in Supabase Dashboard**: Go to Settings → Database → Connection string and test the connection
4. **Check firewall/network**: Ensure your network allows connections to Supabase

## Alternative: Get Connection String from Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/bmhyvwbjljfpuqhggbsy/settings/database
2. Under **Connection string**, select:
   - **Connection pooling** → Copy the URI (use for `DATABASE_URL`)
   - **Direct connection** → Copy the URI (use for `DIRECT_URL`)
3. Replace `[YOUR-PASSWORD]` in the copied strings with your actual password






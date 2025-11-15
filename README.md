# IngreGo - Recipe App with Authentication

A modern Next.js application for scanning ingredients and getting personalized recipe suggestions, with full authentication support.

## Features

- 🔐 Full authentication system (Credentials + Google OAuth)
- 📸 Ingredient scanning
- 🍳 Recipe suggestions
- 📱 Meal planning
- 🌙 Dark mode ready
- 📱 Mobile responsive

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth v5 (Auth.js)
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Optional: Google OAuth
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   ```

   Generate `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**:
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed demo user (optional)
   npm run db:seed
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Authentication

### Demo Account

After running the seed script, you can log in with:
- **Email**: `demo@ingrego.app`
- **Password**: `demo123`

### Register New Account

1. Navigate to `/auth/register`
2. Fill in name, email, and password
3. Click "Create Account"
4. You'll be redirected to login page

### Login

1. Navigate to `/auth/login`
2. Enter your email and password
3. Optionally check "Remember me" for longer session
4. Click "Sign In"

### Google OAuth (Optional)

To enable Google sign-in:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add credentials to `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── auth/          # Auth API routes
│   ├── auth/               # Auth pages (login/register)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/
│   ├── auth/               # Auth components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   └── validations/        # Zod schemas
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
└── middleware.ts           # Route protection
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with demo data

## Protected Routes

The following routes require authentication:
- `/dashboard`
- `/account`

If not authenticated, users are redirected to `/auth/login?from=<original-path>`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | Yes |
| `NEXTAUTH_URL` | Base URL of your app | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |

## Database

The app uses SQLite for development by default. To switch to PostgreSQL:

1. Update `DATABASE_URL` in `.env`
2. Change `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"`
3. Run `npm run db:migrate`

## License

MIT




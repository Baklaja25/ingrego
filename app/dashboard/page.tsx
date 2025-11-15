import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-3xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    </div>
  )
}

function getInitials(name?: string | null) {
  if (!name) return "IG"
  const parts = name.split(" ").filter(Boolean)
  if (parts.length === 0) return "IG"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?from=/dashboard")
  }

  const userName = session.user.name ?? session.user.email ?? "IngreGo chef"

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-[#FF8C42]/15 bg-gradient-to-r from-[#FBEED7] via-white to-white p-8 shadow-sm">
        <div className="absolute inset-y-0 right-0 w-1/3 rounded-l-full bg-[radial-gradient(circle_at_center,rgba(255,140,66,0.18),transparent_70%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wider text-[#FF8C42]">👋 Welcome back</p>
            <h1 className="text-3xl font-semibold text-[#1E1E1E] sm:text-4xl">
              {userName ? `${userName.split(" ")[0]}, your kitchen is ready` : "Your kitchen is ready"}
            </h1>
            <p className="max-w-xl text-sm text-[#1E1E1E]/70">
              Track your ingredient scans, plan meals, and jump back into cooking with your saved recipes.
            </p>
          </div>
          <Avatar className="h-16 w-16 border-2 border-white shadow-lg ring-2 ring-[#FF8C42]/40">
            <AvatarImage src={session.user.image ?? undefined} alt={userName} />
            <AvatarFallback className="bg-[#FF8C42] text-white text-lg font-semibold">
              {getInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <Suspense fallback={<OverviewSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </div>
  )
}



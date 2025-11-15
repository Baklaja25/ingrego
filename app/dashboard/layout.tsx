import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar"
import { Suspense } from "react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?from=/dashboard")
  }

  return (
    <div className="flex h-screen flex-col">
      <Suspense fallback={<div className="h-16 border-b" />}>
        <DashboardTopbar />
      </Suspense>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:block w-64 border-r bg-card">
          <DashboardSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}



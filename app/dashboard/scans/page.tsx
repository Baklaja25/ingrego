import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ScanHistory } from "@/components/dashboard/scan-history"
import { MiniScanList } from "@/components/MiniScanList"
import { normalizeIngredients } from "@/lib/normalizeIngredients"

function buildBaseUrl() {
  const headerList = headers()
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http")
  const host =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    (headerList.get("host") ? `${protocol}://${headerList.get("host")}` : "http://localhost:3000")

  return host?.endsWith("/") ? host.slice(0, -1) : host
}

async function fetchInitialScans() {
  const baseUrl = buildBaseUrl()
  const cookieHeader = cookies()
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ")

  try {
    const response = await fetch(`${baseUrl}/api/scans?limit=10`, {
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    })

    if (!response.ok) {
      return { items: [], nextCursor: undefined }
    }

    const data = await response.json()
    return {
      items: data.items ?? [],
      nextCursor: data.nextCursor ?? undefined,
    }
  } catch (error) {
    console.error("Failed to fetch initial scans:", error)
    return { items: [], nextCursor: undefined }
  }
}

export default async function ScansPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?from=/dashboard/scans")
  }

  const initialData = await fetchInitialScans()

  const miniListItems = initialData.items.slice(0, 6).map((item: any) => ({
    ...item,
    cacheKey: item.cacheKey ?? normalizeIngredients(item.ingredients ?? []),
  }))

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-[#FF8C42]">History</p>
        <h1 className="text-3xl font-bold tracking-tight">Recent ingredient scans</h1>
        <p className="text-muted-foreground max-w-2xl">
          Browse your complete scanning history, revisit ingredient combinations, and regenerate
          recipes with one click.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Highlights</h2>
        <MiniScanList scans={miniListItems} emptyCtaHref="/scan" />
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Scan history</h2>
          <p className="text-sm text-muted-foreground">
            Load more scans as you need — everything is stored securely in your account.
          </p>
        </div>
        <ScanHistory
          initialItems={initialData.items}
          initialNextCursor={initialData.nextCursor}
        />
      </section>
    </div>
  )
}
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { IngredientUsageChart } from "@/components/dashboard/ingredient-usage-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

async function getIngredientStats(userId: string) {
  const data = await prisma.userIngredientStat.findMany({
    where: { userId },
    orderBy: { count: "desc" },
    take: 15,
  })

  const totalCount = data.reduce((sum, stat) => sum + stat.count, 0)

  return {
    chartData: data.map((stat) => ({
      ingredient: stat.ingredient,
      count: stat.count,
    })),
    listData: data,
    totalCount,
  }
}

export default async function IngredientAnalyticsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/login?from=/dashboard/ingredients")
  }

  const { chartData, listData, totalCount } = await getIngredientStats(session.user.id)

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-[#FF8C42]">Analytics</p>
        <h1 className="text-3xl font-bold tracking-tight">Ingredient usage</h1>
        <p className="text-muted-foreground max-w-2xl">
          Visualize which ingredients you rely on the most across all generated recipes. Use these
          insights to balance your pantry staples or discover new ingredient combinations.
        </p>
      </header>

      <IngredientUsageChart data={chartData} />

      <Card>
        <CardHeader>
          <CardTitle>Top ingredients</CardTitle>
          <CardDescription>
            You&apos;ve used {listData.length || "no"} unique ingredients for a total of{" "}
            {totalCount} tracked appearances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {listData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Start generating recipes to build up your ingredient insights.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {listData.map((stat, index) => (
                <div
                  key={stat.id}
                  className="rounded-2xl border border-[#FBEED7] bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <h3 className="text-lg font-semibold capitalize">{stat.ingredient}</h3>
                    </div>
                    {index === 0 && (
                      <Badge variant="secondary" className="bg-[#FBEED7] text-primary border-0">
                        Most used
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stat.count} appearance{stat.count === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


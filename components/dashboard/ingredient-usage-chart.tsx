"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type IngredientUsageDatum = {
  ingredient: string
  count: number
}

interface IngredientUsageChartProps {
  data: IngredientUsageDatum[]
}

export function IngredientUsageChart({ data }: IngredientUsageChartProps) {
  if (!data?.length) {
    return (
      <Card className="p-8 text-center border-dashed border-primary/30 bg-[#FBEED7]/60">
        <CardTitle>No ingredient data yet</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-2">
          Generate or save some recipes to track your ingredient usage.
        </CardDescription>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Most used ingredients</CardTitle>
        <CardDescription>Your top pantry staples based on generated recipes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ingredient"
              tick={{ fontSize: 12 }}
              tickFormatter={(value: string) =>
                value.length > 12 ? `${value.slice(0, 12)}…` : value
              }
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value: number) => [`${value} uses`, "Count"]}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="count" fill="#FF8C42" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-4">
          {data.slice(0, 10).map((item) => (
            <Badge
              key={item.ingredient}
              variant="secondary"
              className="rounded-full bg-[#FBEED7] text-primary border border-[#FF8C42]/30 capitalize"
            >
              {item.ingredient}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


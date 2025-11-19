"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "./stat-card"
import { MiniScanList } from "./mini-scan-list"
import { QuickActionsFab } from "./quick-actions-fab"
import { ChefHat, ArrowRight, Clock, Users, ScanLine, Bookmark, CalendarDays, Flame } from "lucide-react"
import { useMemo } from "react"
import type { DashboardOverviewData } from "./dashboard-overview"

interface DashboardOverviewClientProps {
  data: DashboardOverviewData
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.6, ease: "easeOut" },
  }),
}

export function DashboardOverviewClient({ data }: DashboardOverviewClientProps) {
  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), [])

  const stats = [
    {
      title: "Total Scans",
      value: data.scans.totalCount,
      description: "All-time ingredient scans",
      icon: <ScanLine size={22} />,
      href: "/dashboard/scans",
      suffix: "",
    },
    {
      title: "Saved Recipes",
      value: data.savedRecipes.count,
      description: "Your curated favorites",
      icon: <Bookmark size={22} />,
      href: "/dashboard/saved",
      suffix: "",
    },
    {
      title: "Meals Planned",
      value: data.thisWeek.totalMeals,
      description: "This week’s meal plan",
      icon: <CalendarDays size={22} />,
      href: "/meal-planner",
      suffix: "",
    },
    {
      title: "Calories (This Week)",
      value: data.thisWeek.totalCalories,
      description: "Across planned meals",
      icon: <Flame size={22} />,
      href: "/meal-planner",
      suffix: " kcal",
    },
  ] as const

  return (
    <div className="space-y-10">
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            description={stat.description}
            value={stat.value}
            suffix={stat.suffix}
            href={stat.href}
            icon={stat.icon}
            index={index}
          />
        ))}
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={1}
        className="grid gap-6 lg:grid-cols-3"
      >
        <Card className="relative flex min-h-[220px] flex-col overflow-hidden rounded-3xl border-none bg-gradient-to-br from-[#FF8C42] via-[#ff9d58] to-[#ffb46b] p-5 text-white shadow-lg lg:col-span-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_65%)]" />
          <div className="relative z-10 flex flex-1 flex-col gap-4">
            <header className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-semibold">This Week&apos;s Fuel</h2>
              <p className="text-sm text-white/80">
                {data.thisWeek.totalMeals} meal{data.thisWeek.totalMeals !== 1 ? "s" : ""} planned so far
              </p>
            </header>
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-white/70">Total calories</p>
                <p className="mt-2 text-4xl font-semibold">
                  {numberFormatter.format(data.thisWeek.totalCalories)} kcal
                </p>
              </div>
              <div className="flex gap-3">
                <div className="rounded-2xl border border-white/25 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/70">Average per meal</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {data.thisWeek.totalMeals > 0
                      ? numberFormatter.format(
                          Math.round(data.thisWeek.totalCalories / Math.max(data.thisWeek.totalMeals, 1))
                        )
                      : 0}{" "}
                    kcal
                  </p>
                </div>
                <div className="rounded-2xl border border-white/25 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/70">Meals planned</p>
                  <p className="mt-2 text-2xl font-semibold">{data.thisWeek.totalMeals}</p>
                </div>
              </div>
            </div>
            <Link href="/meal-planner" className="block">
              <Button className="h-11 w-full rounded-xl bg-white text-[#FF8C42] hover:bg-white/90">
                View Meal Planner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        <SavedRecipesGrid
          totalCount={data.savedRecipes.count}
          recipes={data.savedRecipes.items}
        />
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={2}
        className="grid gap-6 lg:grid-cols-[2fr,1fr]"
      >
        <Card className="rounded-3xl border border-[#FF8C42]/10 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-[#1E1E1E]">Recent Scans</CardTitle>
              <CardDescription className="text-sm text-[#1E1E1E]/70">
                Your latest ingredient discoveries
              </CardDescription>
            </div>
            {data.scans.recent.length > 0 && (
              <Link href="/dashboard/scans">
                <Button variant="ghost" size="sm" className="text-[#FF8C42] hover:text-[#FF8C42]">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="mt-2">
            <MiniScanList scans={data.scans.recent} />
          </CardContent>
        </Card>
      </motion.section>

      {/* Quick Actions FAB - rendered at page level */}
      <QuickActionsFab />

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <TodaysTip tip={data.todaysTip} />
      </motion.section>
    </div>
  )
}

interface SavedRecipesGridProps {
  recipes: Array<{
    id: string
    title: string
    imageUrl?: string | null
    timeMins?: number | null
    servings?: number | null
  }>
  totalCount: number
}

function SavedRecipesGrid({ recipes, totalCount }: SavedRecipesGridProps) {
  if (!recipes.length) {
    return (
      <Card className="flex flex-col justify-center rounded-3xl border border-dashed border-[#FF8C42]/30 bg-[#FFF7EF] text-center text-[#1E1E1E]/70 shadow-sm">
        <div className="p-10">
          <ChefHat className="mx-auto mb-4 text-[#FF8C42]" size={48} />
          <p className="text-sm">No recipes yet! Scan your ingredients to get started 🍳</p>
          <Link href="/scan" className="mt-6 inline-flex">
            <Button className="rounded-xl bg-[#FF8C42] text-white hover:bg-[#ff7b22]">
              Scan ingredients
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex min-h-[220px] flex-col rounded-3xl border border-[#FF8C42]/10 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h3 className="text-xl font-semibold text-[#1E1E1E]">Saved Recipes</h3>
          <p className="text-sm text-[#1E1E1E]/70">
            {totalCount} recipe{totalCount !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Link href="/dashboard/saved">
          <Button variant="ghost" size="sm" className="text-[#FF8C42] hover:text-[#FF8C42]">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe, index) => (
            <motion.article
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.45 }}
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl border border-[#FF8C42]/10 bg-[#FFF8F2] shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <Link href={`/recipes/${recipe.id}`} className="flex h-full flex-col">
                <div className="relative h-32 w-full overflow-hidden rounded-t-2xl bg-[#FBEED7]">
                  {recipe.imageUrl ? (
                    <>
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 200px, 280px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E1E1E]/25 via-transparent" />
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#FFE3C8] via-[#FFF2E4] to-white text-center">
                      <div className="rounded-full bg-white/80 p-3 text-[#FF8C42] shadow-sm">
                        <ChefHat size={24} />
                      </div>
                      <span className="text-xs font-medium text-[#FF8C42]">Photo coming soon</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 p-4">
                  <h3 className="text-base font-semibold text-[#1E1E1E] line-clamp-2">
                    {recipe.title}
                  </h3>
                  <dl className="flex flex-wrap items-center gap-3 text-xs text-[#1E1E1E]/70">
                    {typeof recipe.timeMins === "number" && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-[#FF8C42]" />
                        <span>{recipe.timeMins} mins</span>
                      </div>
                    )}
                    {typeof recipe.servings === "number" && (
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-[#FF8C42]" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    )}
                  </dl>
                  <div className="inline-flex items-center text-sm font-medium text-[#FF8C42]">
                    View recipe
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
        {totalCount > recipes.length && (
          <div className="text-center text-xs text-[#1E1E1E]/60">
            Showing {recipes.length} of {totalCount} saved recipes
          </div>
        )}
      </div>
    </Card>
  )
}

function TodaysTip({ tip }: { tip: string }) {
  return (
    <Card className="relative overflow-hidden rounded-3xl border border-[#FF8C42]/15 bg-gradient-to-r from-[#FFF3E7] via-white to-white shadow-sm">
      <div className="absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_center,rgba(255,140,66,0.18),transparent_70%)]" />
      <CardContent className="relative z-10 flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#FF8C42]">
            Today&apos;s Tip
          </p>
          <p className="mt-2 text-base text-[#1E1E1E]/80">{tip}</p>
        </div>
        <Link href="/scan">
          <Button variant="outline" className="rounded-xl border-[#FF8C42]/40 text-[#FF8C42]">
            Generate a recipe
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}


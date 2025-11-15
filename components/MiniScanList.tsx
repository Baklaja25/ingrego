"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScanItem } from "@/lib/scans"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface MiniScanListProps {
  scans: ScanItem[]
  onRegenerate?: (scanId: string) => void
  isLoading?: boolean
  emptyCtaHref?: string
  regeneratingId?: string | null
}

function getRelativeTime(timestamp: string) {
  const now = Date.now()
  const value = new Date(timestamp).getTime()
  const diff = value - now
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ]

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  for (const [unit, amount] of units) {
    if (Math.abs(diff) > amount || unit === "second") {
      const relativeValue = Math.round(diff / amount)
      return formatter.format(relativeValue, unit)
    }
  }

  return formatter.format(0, "second")
}

function useRelativeTime(timestamp: string) {
  const [relativeTime, setRelativeTime] = useState(() => getRelativeTime(timestamp))

  useEffect(() => {
    const update = () => setRelativeTime(getRelativeTime(timestamp))
    update()

    const intervalId = window.setInterval(update, 60_000)
    return () => window.clearInterval(intervalId)
  }, [timestamp])

  return relativeTime
}

function MiniScanListItem({
  scan,
  onRegenerate,
  regeneratingId,
}: {
  scan: ScanItem
  onRegenerate?: (scanId: string) => void
  regeneratingId?: string | null
}) {
  const relativeTime = useRelativeTime(scan.createdAt)

  return (
    <article
      className={cn(
        "flex w-full min-w-[220px] max-w-[320px] flex-col justify-between rounded-2xl border border-transparent bg-white p-4 shadow-sm transition hover:shadow-md",
        "bg-gradient-to-br from-white via-[#FBEED7]/60 to-white sm:min-w-[260px] sm:max-w-xs"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#FBEED7]">
          {scan.imageUrl ? (
            <Image src={scan.imageUrl} alt="Scan preview" fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-primary/60">
              No image
            </div>
          )}
        </div>
        <div className="truncate">
          <p className="text-sm font-semibold text-foreground" suppressHydrationWarning>
            {relativeTime}
          </p>
          <time
            dateTime={scan.createdAt}
            className="text-xs text-muted-foreground"
            title={new Date(scan.createdAt).toLocaleString()}
          >
            {new Date(scan.createdAt).toLocaleDateString()}
          </time>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {scan.ingredients.slice(0, 4).map((ingredient) => (
          <Badge
            key={ingredient}
            variant="secondary"
            className="rounded-full bg-[#FBEED7] text-primary border border-[#FF8C42]/30 text-xs capitalize"
          >
            {ingredient}
          </Badge>
        ))}
        {scan.ingredients.length > 4 && (
          <Badge variant="outline" className="rounded-full border-[#FF8C42]/30 text-primary text-xs">
            +{scan.ingredients.length - 4}
          </Badge>
        )}
      </div>

      {onRegenerate && (
        <Button
          type="button"
          className="mt-4 w-full rounded-full bg-[#FF8C42] text-white hover:bg-[#ff7b22]"
          onClick={() => onRegenerate(scan.id)}
          disabled={regeneratingId === scan.id}
        >
          {regeneratingId === scan.id ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Working...
            </span>
          ) : (
            "Generate again"
          )}
        </Button>
      )}
    </article>
  )
}

export function MiniScanList({
  scans,
  onRegenerate,
  isLoading = false,
  emptyCtaHref = "/scan",
  regeneratingId,
}: MiniScanListProps) {
  if (isLoading) {
    return <MiniScanListSkeleton />
  }

  if (!scans.length) {
    return (
      <Card className="p-6 flex items-center justify-between rounded-2xl border-dashed border-primary/30 bg-[#FBEED7]">
        <div>
          <p className="text-sm font-medium text-primary">No scans yet</p>
          <p className="text-muted-foreground text-sm">
            Start by scanning your pantry or fridge ingredients.
          </p>
        </div>
        <Button
          asChild
          className="bg-[#FF8C42] hover:bg-[#ff7b22] text-white rounded-full px-4"
        >
          <Link href={emptyCtaHref}>Scan now</Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:overflow-x-auto sm:pb-2 sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden">
      {scans.map((scan) => (
        <MiniScanListItem
          key={scan.id}
          scan={scan}
          onRegenerate={onRegenerate}
          regeneratingId={regeneratingId}
        />
      ))}
    </div>
  )
}

export function MiniScanListSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="min-w-[260px] max-w-xs rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-9 w-full rounded-full" />
        </div>
      ))}
    </div>
  )
}


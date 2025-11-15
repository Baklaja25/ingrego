"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { motion, useAnimation } from "framer-motion"

interface StatCardProps {
  title: string
  description?: string
  value: number
  icon?: ReactNode
  href?: string
  className?: string
  suffix?: string
  prefix?: string
  index?: number
}

export function StatCard({
  title,
  description,
  value,
  icon,
  href,
  className,
  suffix,
  prefix,
  index = 0,
}: StatCardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <Card
        className={cn(
          "h-full rounded-2xl border border-[#FF8C42]/10 bg-gradient-to-br from-[#FFF8F2] to-[#FBEED7] p-5 shadow-sm transition-all duration-300 hover:shadow-lg",
          className
        )}
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#1E1E1E]/60">{title}</p>
              <AnimatedNumber value={Math.max(0, value)} prefix={prefix} suffix={suffix} />
              {description && (
                <p className="mt-1 text-sm text-[#1E1E1E]/70">{description}</p>
              )}
            </div>
            {icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-[#FF8C42] shadow-inner">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8C42]/40 focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    )
  }

  return content
}

function AnimatedNumber({
  value,
  prefix,
  suffix,
}: {
  value: number
  prefix?: string
  suffix?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const controls = useAnimation()
  const formatted = useMemo(() => displayValue.toLocaleString("en-US"), [displayValue])

  useEffect(() => {
    controls.start({
      opacity: [0.7, 1],
      transition: { duration: 0.4 },
    })

    const duration = 600
    const start = performance.now()

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(value * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, controls])

  return (
    <motion.p animate={controls} className="mt-2 text-3xl font-semibold text-[#FF8C42]">
      {prefix}
      {formatted}
      {suffix}
    </motion.p>
  )
}

"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AuthCardProps {
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-lg border bg-card p-8 shadow-lg",
        className
      )}
    >
      {children}
    </div>
  )
}




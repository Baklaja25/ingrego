"use client"

import { getPasswordStrength } from "@/lib/validations/account"
import { useEffect, useState } from "react"

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(getPasswordStrength(password))

  useEffect(() => {
    setStrength(getPasswordStrength(password))
  }, [password])

  if (!password) return null

  const width = `${(strength.score / 6) * 100}%`

  return (
    <div className="space-y-2">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium">{strength.label}</span>
      </p>
    </div>
  )
}



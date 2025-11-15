"use client"

import { useState } from "react"

export function usePremiumModal() {
  const [open, setOpen] = useState(false)
  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  return {
    open,
    show,
    hide,
    onOpenChange: setOpen,
  }
}


















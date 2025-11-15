"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"

type ShoppingListItem = {
  name: string
  count: number
  category?: string
}

interface ShoppingListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  weekStart: string
  items: ShoppingListItem[]
  isLoading?: boolean
}

export function ShoppingListModal({
  open,
  onOpenChange,
  weekStart,
  items,
  isLoading = false,
}: ShoppingListModalProps) {
  const formattedWeek = useMemo(() => {
    try {
      return format(new Date(weekStart), "MMM d, yyyy")
    } catch {
      return ""
    }
  }, [weekStart])

  const grouped = useMemo(() => {
    return items.reduce((acc, item) => {
      const category = item.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {} as Record<string, ShoppingListItem[]>)
  }, [items])

  const exportCSV = () => {
    if (!items.length) return
    const rows = [["Category", "Ingredient", "Quantity"]]
    for (const [category, categoryItems] of Object.entries(grouped)) {
      for (const item of categoryItems) {
        rows.push([category, item.name, String(item.count)])
      }
    }
    const csvContent = rows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, `shopping-list-${formattedWeek || "week"}.csv`)
  }

  const exportPDF = () => {
    if (!items.length) return

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Weekly Shopping List", 20, 20)
    doc.setFontSize(11)
    doc.text(`Week of ${formattedWeek || "this week"}`, 20, 28)

    let y = 36
    for (const [category, categoryItems] of Object.entries(grouped)) {
      doc.setFontSize(13)
      doc.text(category, 20, y)
      y += 7
      doc.setFontSize(11)
      for (const item of categoryItems) {
        doc.text(`• ${item.name} (x${item.count})`, 26, y)
        y += 6

        if (y > 270) {
          doc.addPage()
          y = 20
        }
      }
      y += 8
    }

    doc.save(`shopping-list-${formattedWeek || "week"}.pdf`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto space-y-6 rounded-2xl border border-[#FF8C42]/20 bg-gradient-to-b from-[#FBEED7]/60 via-white to-white shadow-xl">
        <DialogHeader className="space-y-2 rounded-2xl bg-gradient-to-r from-[#FBEED7] via-white to-white p-4">
          <DialogTitle className="text-xl font-semibold text-[#1E1E1E]">
            Weekly shopping list
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Ingredients for the week starting {formattedWeek || "this week"}.
          </p>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Generating shopping list…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No ingredients planned yet. Add recipes to your meal planner first.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {Object.entries(grouped).map(([category, categoryItems]) => (
                <div key={category} className="rounded-xl border border-border/80 p-3">
                  <h3 className="font-semibold text-primary mb-2">{category}</h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {categoryItems.map((item) => (
                      <li key={`${category}-${item.name}`} className="text-sm capitalize">
                        {item.name}{" "}
                        <span className="text-muted-foreground">×{item.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2">
                <FileText size={16} /> CSV
              </Button>
              <Button
                onClick={exportPDF}
                className="flex items-center gap-2 bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] text-white hover:brightness-105"
              >
                <Download size={16} /> PDF
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}


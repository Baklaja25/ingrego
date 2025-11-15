"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DeleteAccountDialog } from "./delete-account-dialog"
import { AlertTriangle } from "lucide-react"

export function AccountDangerZone() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive mb-1">
            Delete Account
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be
            certain. This will permanently delete your account and remove all
            your data from our servers, including:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
            <li>All saved recipes</li>
            <li>All ingredient scans</li>
            <li>All meal plans</li>
            <li>All account settings</li>
          </ul>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}



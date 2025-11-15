"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function AccountConnections() {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  useEffect(() => {
    checkConnections()
  }, [])

  const checkConnections = async () => {
    try {
      const response = await fetch("/api/account/connections")
      if (response.ok) {
        const data = await response.json()
        setIsGoogleConnected(data.connections?.google || false)
      }
    } catch (error) {
      console.error("Error checking connections:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectGoogle = async () => {
    setIsConnecting(true)
    try {
      await signIn("google", { callbackUrl: "/account" })
    } catch (error) {
      toast.error("Failed to connect Google account")
      setIsConnecting(false)
    }
  }

  const handleDisconnectGoogle = async () => {
    setIsDisconnecting(true)
    try {
      const response = await fetch("/api/account/connections/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider: "google" }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to disconnect Google account")
        return
      }

      toast.success("Google account disconnected successfully")
      setIsGoogleConnected(false)
      // Refresh connections
      await checkConnections()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsDisconnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium">Google</p>
            <p className="text-sm text-muted-foreground">
              {isGoogleConnected
                ? "Connected to your Google account"
                : "Connect your Google account"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isGoogleConnected ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectGoogle}
                disabled={isDisconnecting}
              >
                {isDisconnecting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnectGoogle}
              disabled={isConnecting}
            >
              {isConnecting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Connect
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}


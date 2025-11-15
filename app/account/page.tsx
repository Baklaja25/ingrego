import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AccountProfile } from "@/components/account/account-profile"
import { AccountSecurity } from "@/components/account/account-security"
import { AccountConnections } from "@/components/account/account-connections"
import { AccountDangerZone } from "@/components/account/account-danger-zone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AccountPage() {
  const session = await auth()

  // Session is already checked in layout, but we need it for user data
  if (!session?.user) {
    redirect("/auth/login?from=/account")
  }

  return (
    <div className="container max-w-4xl p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your profile information and avatar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountProfile user={session.user} />
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Change your password and manage security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSecurity />
        </CardContent>
      </Card>

      {/* Connections Section */}
      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
          <CardDescription>
            Manage your connected accounts and OAuth providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountConnections />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountDangerZone />
        </CardContent>
      </Card>
    </div>
  )
}


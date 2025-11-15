import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UpgradePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-10 px-6 py-20 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-[#FF8C42]">Upgrade to Premium</h1>
        <p className="text-muted-foreground">
          Unlock every feature — AI ingredient scans, unlimited recipes, meal planning, shopping lists, cook mode, analytics, and more.
        </p>
      </div>

      <div className="w-full rounded-3xl border border-[#FBEED7] bg-white shadow-sm">
        <div className="rounded-t-3xl bg-[#FBEED7]/50 px-8 py-6">
          <p className="text-sm font-semibold text-[#FF8C42]">Premium Plan</p>
          <h2 className="text-3xl font-bold text-[#1E1E1E]">€6.99 / month</h2>
          <p className="text-sm text-muted-foreground">or save 30% with annual billing</p>
        </div>

        <div className="px-8 py-6 space-y-3">
          <ul className="space-y-2 text-left text-sm text-muted-foreground">
            <li>• Unlimited ingredient scans & AI recipes</li>
            <li>• Weekly meal planner + shopping lists</li>
            <li>• Voice-guided cook mode and analytics</li>
            <li>• Cancel anytime</li>
          </ul>

          <Button className="mt-4 h-12 w-full rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] text-lg font-semibold text-white hover:brightness-105">
            Continue to checkout
          </Button>

          <p className="text-xs text-muted-foreground">
            Secure payments powered by Stripe · Questions? <Link href="/help" className="text-[#FF8C42]">Contact support</Link>
          </p>
        </div>
      </div>

      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Maybe later, take me back home
      </Link>
    </div>
  )
}
















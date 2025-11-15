"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export function Header() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="IngreGo Logo"
              width={90}
              height={90}
              className="h-auto w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/scan" className="text-sm font-medium hover:text-primary transition-colors">
              Scan
            </Link>
            <Link href="/meal-planner" className="text-sm font-medium hover:text-primary transition-colors">
              Meal Planner
            </Link>
            <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
              Blog
            </Link>
          </nav>

          {/* Search - centered */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs mx-4">
            <Input
              type="text"
              placeholder="Search Recipe"
              className="flex-1"
            />
            <Button size="icon" className="bg-[#FF6B35] hover:bg-[#E55A2B] flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 19L14.65 14.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {session ? (
              <>
                <Link href="/account">
                  <Button variant="ghost" size="sm">
                    {session.user.name || session.user.email}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/register"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                >
                  Sign Up
                </Link>
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#FF6B35] hover:bg-[#E55A2B] text-white h-9 rounded-md px-3"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t py-4 space-y-2">
            <Link href="/" className="block px-4 py-2 hover:bg-accent">Home</Link>
            <Link href="/scan" className="block px-4 py-2 hover:bg-accent">Scan</Link>
            <Link href="/meal-planner" className="block px-4 py-2 hover:bg-accent">Meal Planner</Link>
            <Link href="/blog" className="block px-4 py-2 hover:bg-accent">Blog</Link>
            {session ? (
              <>
                <Link href="/account" className="block px-4 py-2 hover:bg-accent">Account</Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left px-4 py-2 hover:bg-accent"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/register" className="block px-4 py-2 hover:bg-accent">Sign Up</Link>
                <Link href="/auth/login" className="block px-4 py-2 hover:bg-accent">Sign In</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}


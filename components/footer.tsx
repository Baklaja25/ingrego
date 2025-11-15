"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="IngreGo Logo"
                width={55}
                height={55}
                className="h-auto w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Turn your ingredients into delicious recipes with AI-powered meal planning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-[#FF8C42] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/scan" className="text-sm text-muted-foreground hover:text-[#FF8C42] transition-colors">
                  Scan Ingredients
                </Link>
              </li>
              <li>
                <Link href="/meal-planner" className="text-sm text-muted-foreground hover:text-[#FF8C42] transition-colors">
                  Meal Planner
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-[#FF8C42] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-[#FF8C42] transition-colors">
                  Cooking Tips
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-[#FF8C42] transition-colors">
                  Recipe Ideas
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-[#FF8C42] transition-colors">
                  Meal Planning
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-[#FF8C42] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-sm text-muted-foreground hover:text-[#FF8C42] transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} IngreGo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}



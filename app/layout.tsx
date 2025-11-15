import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/app/providers"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "IngreGo - Turn Your Ingredients Into Delicious Recipes",
  description: "Snap a photo of your ingredients and instantly get personalized recipe suggestions.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster position="top-center" />
          </Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}


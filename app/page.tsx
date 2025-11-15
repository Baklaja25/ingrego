import Image from "next/image"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const session = await auth()
  
  // Redirect logged in users to dashboard
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-white to-blue-50 py-12 px-4 md:py-16 lg:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="max-w-lg">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4">
                Turn Your Ingredients Into Delicious Recipes
              </h1>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Snap a photo of your ingredients and instantly get personalized recipe suggestions. No more food waste, no more recipe blocks!
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link 
                  href="/scan"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#1a3d53] hover:bg-[#0f2a3a] text-white px-7 py-3.5 gap-2.5"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10C3 10 5 6 10 6C15 6 17 10 17 10C17 10 15 14 10 14C5 14 3 10 3 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Scan Ingredients
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link 
                  href="/auth/register"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-accent hover:text-accent-foreground px-7 py-3.5"
                >
                  Create Account
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <Image
                src="/images/ingrego-header-girl-2.png"
                alt="Chef with ingredients"
                width={600}
                height={600}
                className="h-auto w-full max-w-md lg:max-w-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-8 md:py-12 px-4 bg-white overflow-visible">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Recipe Card 1 */}
            <div className="bg-white rounded-2xl p-4 shadow-md flex gap-5 relative overflow-visible hover:shadow-lg transition-shadow">
              <div className="absolute -top-2 -left-2 h-[140px] w-[140px] overflow-hidden rounded-full shadow-lg">
                <Image
                  src="/images/dish-sea-food-spageti.png"
                  alt="Seafood Spaghetti"
                  width={140}
                  height={140}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="ml-[130px] flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2.5">Seafood Spaghetti</h3>
                <div className="flex gap-5 mb-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 4V8L10.5 10.5" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    0h 25mins
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 14C3 11.7909 5.23858 10 8 10C10.7614 10 13 11.7909 13 14" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    3-4
                  </span>
                </div>
                <p className="text-xs text-gray-500">Rich tomato sauce with fresh seafood</p>
              </div>
            </div>

            {/* Recipe Card 2 */}
            <div className="bg-white rounded-2xl p-4 shadow-md flex gap-5 relative overflow-visible hover:shadow-lg transition-shadow">
              <div className="absolute -top-2 -left-2 h-[140px] w-[140px] overflow-hidden rounded-full shadow-lg">
                <Image
                  src="/images/poke-bowl.png"
                  alt="Poke Bowl"
                  width={140}
                  height={140}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="ml-[130px] flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2.5">Poke Bowl</h3>
                <div className="flex gap-5 mb-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 4V8L10.5 10.5" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    0h 15mins
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 14C3 11.7909 5.23858 10 8 10C10.7614 10 13 11.7909 13 14" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    1-2
                  </span>
                </div>
                <p className="text-xs text-gray-500">Fresh salmon with colorful vegetables</p>
              </div>
            </div>

            {/* Recipe Card 3 */}
            <div className="bg-white rounded-2xl p-4 shadow-md flex gap-5 relative overflow-visible hover:shadow-lg transition-shadow">
              <div className="absolute -top-2 -left-2 h-[140px] w-[140px] overflow-hidden rounded-full shadow-lg">
                <Image
                  src="/images/white-meed-brocoli.png"
                  alt="Chicken & Broccoli Bowl"
                  width={140}
                  height={140}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="ml-[130px] flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2.5">Chicken & Broccoli Bowl</h3>
                <div className="flex gap-5 mb-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 4V8L10.5 10.5" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    0h 35mins
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 14C3 11.7909 5.23858 10 8 10C10.7614 10 13 11.7909 13 14" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    1
                  </span>
                </div>
                <p className="text-xs text-gray-500">Grilled chicken with roasted vegetables</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#1a3d53] rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-[#1a3d53]">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 26C23.3137 26 26 23.3137 26 20C26 16.6863 23.3137 14 20 14C16.6863 14 14 16.6863 14 20C14 23.3137 16.6863 26 20 26Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 20C6 20 10 12 20 12C30 12 34 20 34 20C34 20 30 28 20 28C10 28 6 20 6 20Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Capture Ingredients</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Take a photo of the ingredients you have available in your kitchen
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#1a3d53] rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-[#1a3d53]">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28 12L12 28M12 12L28 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Analyzes</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Our intelligent system identifies your ingredients and matches them with recipes
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#1a3d53] rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-[#1a3d53]">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 10L12 18H16V26H24V18H28L20 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Recipes</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Receive personalized recipe suggestions based on what you already have
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-[#1a3d53] text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-white mb-5">Ready to Create Delicious Meals?</h2>
          <p className="text-lg text-white/95 mb-10 max-w-xl mx-auto leading-relaxed">
            Stop worrying about what to cook with the ingredients you have. Let IngreGo suggest perfect recipes for you!
          </p>
          <Link 
            href="/scan"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-[#1a3d53] hover:bg-gray-100 px-8 py-4 border border-white/30"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10C3 10 5 6 10 6C15 6 17 10 17 10C17 10 15 14 10 14C5 14 3 10 3 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Scan Your Ingredients
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}


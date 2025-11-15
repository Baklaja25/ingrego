import Image from "next/image"
import { getAllPosts } from "@/lib/blog"
import { BlogList } from "@/components/blog/BlogList"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Ingrego Blog | Smart Cooking & Meal Planning Tips",
  description: "Discover cooking hacks, AI recipes, and meal planning ideas from Ingrego.",
}

export default function BlogPage() {
  const posts = getAllPosts()
  const categories = Array.from(new Set(posts.flatMap((post) => post.tags || []))).sort()

  return (
    <>
      <Header />
      <section className="min-h-screen bg-gradient-to-b from-white via-[#FBEED7]/35 to-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] border border-[#FBEED7]/80 shadow-2xl">
          <Image
            src="/images/blog/header-blog-placeholder.svg"
            alt="IngreGo Blog - Fresh inspiration for your next meal"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C42]/60 via-[#FF8C42]/40 to-transparent" />
          <div className="relative z-10 flex max-w-2xl flex-col gap-6 px-8 py-12 text-white sm:px-12 sm:py-16 lg:px-20 lg:py-24">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/75">IngreGo Blog</span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Fresh inspiration for your next meal
            </h1>
            <p className="text-sm text-white/90 sm:text-lg">
              Turn leftovers into new favorites, explore the science of cooking, and plan smarter with an AI sous-chef.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/80 sm:text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Filter by category
              </span>
              <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2">
                30+ recipes, tips, and AI kitchen hacks
              </span>
            </div>
          </div>
        </div>

        <BlogList posts={posts} categories={categories} />
      </div>
    </section>
    <Footer />
    </>
  )
}

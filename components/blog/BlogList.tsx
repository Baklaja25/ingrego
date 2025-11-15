"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Mail } from "lucide-react"
import clsx from "clsx"

import type { BlogListItem } from "@/lib/blog"
import { BlogCard } from "./BlogCard"

type BlogListProps = {
  posts: BlogListItem[]
  categories: string[]
}

const ALL_CATEGORY = "All"

export function BlogList({ posts, categories }: BlogListProps) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY)
  const options = useMemo(() => [ALL_CATEGORY, ...categories], [categories])

  const filteredPosts = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) {
      return posts
    }

    return posts.filter((post) => post.tags?.includes(activeCategory))
  }, [activeCategory, posts])

  const spotlightPosts = filteredPosts.slice(0, 6)
  const sidebarPosts = posts.slice(0, 4)

  return (
    <div className="flex flex-col gap-10 lg:gap-14">
      <div className="flex flex-wrap items-center gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setActiveCategory(option)}
            className={clsx(
              "rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200",
              activeCategory === option
                ? "border-[#FF8C42] bg-[#FF8C42] text-white shadow-sm"
                : "border-[#FBEED7] bg-white text-[#A87033] hover:border-[#FF8C42]/60 hover:bg-[#FFF4E8]"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(280px,1fr)] lg:gap-12">
        <div className="flex flex-col gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post.slug} post={post} variant="standard" />
          ))}
        </div>

        <aside className="flex flex-col gap-6 lg:gap-8">
          <div className="rounded-3xl border border-[#FBEED7] bg-white/95 p-6 shadow-sm lg:p-8">
            <h3 className="text-lg font-semibold text-[#1F1F1F]">Popular posts</h3>
            <ul className="mt-5 space-y-4">
              {sidebarPosts.map((post) => (
                <li key={post.slug} className="group rounded-2xl bg-[#FFF8EE] p-4 transition hover:shadow-md">
                  <Link href={`/blog/${post.slug}`} className="flex flex-col gap-1.5">
                    <span className="text-xs uppercase tracking-wide text-[#D96B1B]/80">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-sm font-semibold text-[#3C2F2F]">{post.title}</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-[#C65A10]">
                      {post.readTime} min read
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-[#FFDEBC] bg-gradient-to-br from-[#FFF4E8] via-white to-[#FFEBD6] p-6 shadow-inner lg:p-8">
            <div className="flex items-center gap-3 text-[#C65A10]">
              <Mail className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Join the newsletter</h3>
            </div>
            <p className="mt-3 text-sm text-[#6E5643]">
              Get seasonal recipes, meal planning tips, and AI kitchen tricks straight to your inbox once a week.
            </p>
            <form className="mt-5 flex flex-col gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full rounded-full border border-[#FBEED7] bg-white px-4 py-3 text-sm focus:border-[#FF8C42] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20"
              />
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF8C42] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E3742C]"
              >
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  )
}


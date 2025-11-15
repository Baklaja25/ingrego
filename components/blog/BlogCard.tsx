"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { CalendarDays, Clock } from "lucide-react"
import clsx from "clsx"

import type { BlogListItem } from "@/lib/blog"

type BlogCardVariant = "featured" | "standard"

type BlogCardProps = {
  post: BlogListItem
  variant?: BlogCardVariant
}

export function BlogCard({ post, variant = "standard" }: BlogCardProps) {
  const primaryTag = post.tags?.[0]
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group h-full"
    >
      <Link
        href={`/blog/${post.slug}`}
        className={clsx(
          "flex h-full overflow-hidden rounded-3xl border border-[#FBEED7]/80 bg-white/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
          variant === "featured"
            ? "flex-col"
            : "flex-col gap-0 sm:flex-row sm:items-center sm:gap-6 sm:p-4 sm:pr-6"
        )}
      >
        <div
          className={clsx(
            "relative overflow-hidden bg-[#FFF4E8]",
            variant === "featured"
              ? "h-64 w-full"
              : "h-48 w-full shrink-0 rounded-b-[32px] sm:h-40 sm:w-48 sm:rounded-[24px]"
          )}
        >
          <Image
            src={post.image || "/images/blog-placeholder.jpg"}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            priority={variant === "featured"}
          />
        </div>

        <div
          className={clsx(
            "flex flex-1 flex-col justify-between",
            variant === "featured" ? "gap-5 p-8" : "gap-3 p-6 sm:p-0"
          )}
        >
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-[#FF8C42]">
            {primaryTag && (
              <span className="rounded-full bg-[#FFEADB] px-3 py-1 text-[#D96B1B]">{primaryTag}</span>
            )}
            <span className="flex items-center gap-1 text-[#FF8C42]/80">
              <CalendarDays className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          </div>

          <div className="space-y-3">
            <h2
              className={clsx(
                "font-semibold text-[#1F1F1F]",
                variant === "featured" ? "text-2xl leading-tight" : "text-lg sm:text-xl"
              )}
            >
              {post.title}
            </h2>
            <p className="text-sm text-[#5F5F5F]">{post.excerpt}</p>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm font-medium text-[#C65A10]">
            <span className="flex items-center gap-2 text-[#C65A10]">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
            <span className="transition-colors duration-200 group-hover:text-[#FF8C42]">Read more →</span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
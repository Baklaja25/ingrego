#!/usr/bin/env tsx

/**
 * Script to generate sitemap.xml when a new blog article is added.
 * Run this script manually after adding a new blog post:
 *   npm run sitemap:generate
 */

import fs from "fs"
import path from "path"
import { getAllPosts } from "../lib/blog"

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://ingrego.com"

// Static pages
const staticPages = [
  {
    url: baseUrl,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${baseUrl}/scan`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${baseUrl}/blog`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${baseUrl}/auth/login`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${baseUrl}/auth/register`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
]

function generateSitemap() {
  console.log("🔍 Generating sitemap.xml...")

  // Get all blog posts
  let blogPosts: Array<{
    url: string
    lastModified: string
    changeFrequency: string
    priority: number
  }> = []

  try {
    const posts = getAllPosts()
    blogPosts = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date).toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    }))
    console.log(`✅ Found ${posts.length} blog posts`)
  } catch (error) {
    console.error("❌ Error reading blog posts:", error)
  }

  // Generate XML
  const allPages = [...staticPages, ...blogPosts]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`

  // Write to public/sitemap.xml
  const publicDir = path.join(process.cwd(), "public")
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const sitemapPath = path.join(publicDir, "sitemap.xml")
  fs.writeFileSync(sitemapPath, sitemap, "utf8")

  console.log(`✅ Sitemap generated successfully: ${sitemapPath}`)
  console.log(`📊 Total URLs: ${allPages.length} (${staticPages.length} static + ${blogPosts.length} blog posts)`)
}

// Run the script
generateSitemap()




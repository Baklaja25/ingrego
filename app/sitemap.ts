import { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/blog"

/**
 * Dynamic sitemap generator (fallback).
 * 
 * NOTE: This is a fallback. The primary sitemap is generated manually via:
 *   npm run sitemap:generate
 * 
 * The static file at public/sitemap.xml takes precedence and is served automatically.
 * This dynamic route only runs if the static file doesn't exist.
 * 
 * To update the sitemap after adding a new blog article, run:
 *   npm run sitemap:generate
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://ingrego.com"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/scan`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  // Blog posts - only include posts that exist
  let blogPosts: MetadataRoute.Sitemap = []
  try {
    const posts = getAllPosts()
    blogPosts = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error("Error generating blog posts sitemap:", error)
  }

  return [...staticPages, ...blogPosts]
}


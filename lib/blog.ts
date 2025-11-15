import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"

const postsDirectory = path.join(process.cwd(), "content/blog")

export type BlogListItem = {
  slug: string
  title: string
  excerpt: string
  date: string
  image: string
  tags?: string[]
  author?: string
  readTime: number
}

export type BlogPost = BlogListItem & {
  content: string
}

function ensureDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
  }
}

export function getAllPosts(): BlogListItem[] {
  ensureDirectory()
  const fileNames = fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"))

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "")
    const filePath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(filePath, "utf8")
    const { data, content } = matter(fileContents)
    const readStats = readingTime(content)

    return {
      slug,
      title: data.title as string,
      excerpt: (data.excerpt || data.description || "") as string,
      date: data.date as string,
      image: (data.image || "/images/blog-placeholder.jpg") as string,
      tags: data.tags as string[] | undefined,
      author: data.author as string | undefined,
      readTime: Math.max(1, Math.round(readStats.minutes)),
    }
  })

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost {
  ensureDirectory()
  const filePath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(fileContents)
  const readStats = readingTime(content)

  return {
    slug,
    title: data.title as string,
    excerpt: (data.excerpt || data.description || "") as string,
    date: data.date as string,
    image: (data.image || "/images/blog-placeholder.jpg") as string,
    tags: data.tags as string[] | undefined,
    author: data.author as string | undefined,
    readTime: Math.max(1, Math.round(readStats.minutes)),
    content,
  }
}


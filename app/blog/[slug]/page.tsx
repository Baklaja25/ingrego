import Image from "next/image"
import { notFound } from "next/navigation"
import { remark } from "remark"
import html from "remark-html"
import DOMPurify from "isomorphic-dompurify"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { BlogCard } from "@/components/blog/BlogCard"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) {
    return {}
  }
  return {
    title: `${post.title} | IngreGo Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) {
    notFound()
  }

  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug && post.tags?.some((tag) => p.tags?.includes(tag)))
    .slice(0, 2)

  const processed = await remark().use(html).process(post.content)
  const rawHtml = processed.toString()
  // Sanitize HTML to prevent XSS attacks
  const contentHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  })

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-white via-[#FBEED7]/20 to-white">
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Header Section */}
        <header className="mb-10 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFEADB] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D96B1B]">
            {post.tags?.[0] || "Blog Post"}
          </div>
          <h1 className="text-4xl font-bold leading-tight text-[#1E1E1E] sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] bg-clip-text text-transparent">
              {post.title}
            </span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-[#5F5F5F]">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            {post.author && (
              <>
                <span className="text-[#D96B1B]">·</span>
                <span className="font-medium text-[#FF8C42]">{post.author}</span>
              </>
            )}
            <span className="text-[#D96B1B]">·</span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readTime} min read
            </span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative mb-12 h-[400px] w-full overflow-hidden rounded-3xl border-2 border-[#FBEED7]/60 shadow-xl sm:h-[500px]">
          <Image 
            src={post.image || "/images/blog-placeholder.jpg"} 
            alt={post.title} 
            fill 
            className="object-cover transition-transform duration-700 hover:scale-105" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div
          className="blog-content prose prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:font-medium prose-strong:text-[#1E1E1E] prose-ul:space-y-2 prose-ol:space-y-2 prose-li:leading-relaxed max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* CTA Section */}
        <section className="mt-16 rounded-3xl border-2 border-[#FBEED7]/60 bg-gradient-to-br from-[#FBEED7]/40 via-[#FBEED7]/30 to-[#FFEADB]/40 px-8 py-10 text-center shadow-lg backdrop-blur-sm sm:px-12 sm:py-12">
          <h2 className="text-3xl font-bold text-[#FF8C42] sm:text-4xl">
            Ready to Cook Smarter?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#5F5F5F] sm:text-lg">
            Scan your ingredients, discover AI-generated recipes, and plan your meals effortlessly.
          </p>
          <a
            href="/scan"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#ffb46b] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Start for Free
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </section>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="mt-20 border-t border-[#FBEED7]/60 pt-12">
            <h3 className="mb-8 text-3xl font-bold text-[#1E1E1E]">Related Posts</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {related.map((relatedPost) => (
                <BlogCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
    <Footer />
    </>
  )
}


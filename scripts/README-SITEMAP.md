# Sitemap Generation

The sitemap is now **manually updated** only when you add a new blog article.

## How to Update Sitemap

After adding a new blog post to `content/blog/`, run:

```bash
npm run sitemap:generate
```

This will:
- Scan all blog posts in `content/blog/`
- Generate a new `public/sitemap.xml` file
- Include all static pages and blog posts

## How It Works

1. **Static File**: The script generates `public/sitemap.xml` which Next.js serves automatically
2. **Manual Control**: The sitemap only updates when you explicitly run the script
3. **Fallback**: `app/sitemap.ts` exists as a dynamic fallback, but the static file takes precedence

## What's Included

- Static pages: Home, Scan, Blog, Login, Register
- All blog posts from `content/blog/*.md`
- Proper priorities and change frequencies
- Last modified dates from blog post frontmatter

## Notes

- The sitemap uses your `NEXT_PUBLIC_APP_URL` or `NEXTAUTH_URL` environment variable for the base URL
- Defaults to `https://ingrego.com` if no URL is set
- Blog posts are sorted by date (newest first)


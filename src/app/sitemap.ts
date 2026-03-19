import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'

const BASE_URL = 'https://sajulab.com'
const LOCALES  = ['ko', 'en', 'ja', 'zh', 'es']

const STATIC_PAGES = [
  { path: '',              priority: 1,   freq: 'daily'   as const },
  { path: '/blog',         priority: 0.9, freq: 'daily'   as const },
  { path: '/compatibility',priority: 0.9, freq: 'monthly' as const },
  { path: '/about',        priority: 0.5, freq: 'monthly' as const },
  { path: '/contact',      priority: 0.5, freq: 'monthly' as const },
  { path: '/privacy',      priority: 0.3, freq: 'yearly'  as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const now   = new Date()

  const staticUrls = LOCALES.flatMap((locale) =>
    STATIC_PAGES.map(({ path, priority, freq }) => ({
      url:             `${BASE_URL}/${locale}${path}`,
      lastModified:    now,
      changeFrequency: freq,
      priority,
    }))
  )

  const postUrls = LOCALES.flatMap((locale) =>
    posts.map((post) => ({
      url:             `${BASE_URL}/${locale}/blog/${post.slug}`,
      lastModified:    new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority:        0.7,
    }))
  )

  return [...staticUrls, ...postUrls]
}

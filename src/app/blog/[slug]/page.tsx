import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { markdownToHtml } from '@/lib/markdownToHtml'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AdInContent } from '@/components/AdSense'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const htmlContent = markdownToHtml(post.content)

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: '사주역학연구소',
    },
    publisher: {
      '@type': 'Organization',
      name: '사주역학연구소',
    },
    keywords: post.tags.join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-indigo-500">홈</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-indigo-500">블로그</Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-gray-400">{post.readingTime} 읽기</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-gray-500 text-lg leading-relaxed mb-6">
            {post.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-400 pb-6 border-b border-gray-100">
            <time>
              {new Date(post.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Top Ad */}
        {/* <AdInContent /> */}

        {/* Content */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Mid Ad */}
        {/* <AdInContent /> */}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="bg-indigo-50 rounded-xl p-6 text-center">
            <p className="text-gray-700 font-medium mb-3">
              더 많은 사주역학 지식을 원하신다면?
            </p>
            <Link
              href="/blog"
              className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors inline-block"
            >
              다른 글 보기
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}

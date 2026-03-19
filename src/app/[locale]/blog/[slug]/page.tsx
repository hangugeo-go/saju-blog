import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { markdownToHtml } from '@/lib/markdownToHtml'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'

interface Props {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateStaticParams() {
  const posts   = getAllPosts()
  const locales = ['ko', 'en', 'ja', 'zh', 'es']
  return locales.flatMap((locale) =>
    posts.map((post) => ({ locale, slug: post.slug }))
  )
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
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const htmlContent = markdownToHtml(post.content)

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

        {/* Content */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* CTA Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="bg-indigo-50 rounded-xl p-6 text-center">
            <p className="text-gray-700 font-medium mb-2">
              두 사람의 역학적 궁합이 궁금하신가요?
            </p>
            <p className="text-gray-500 text-sm mb-4">
              사주팔자·자미두수·점성술 통합 궁합 분석 서비스
            </p>
            <Link
              href="/compatibility"
              className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors inline-block"
            >
              궁합 분석하기 →
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}

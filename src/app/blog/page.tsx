import { getAllPosts, getAllCategories } from '@/lib/posts'
import BlogCard from '@/components/BlogCard'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '블로그',
  description: '사주역학, 명리학, 오행, 천간지지에 관한 전문 글들을 모아보세요.',
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: selectedCategory } = await searchParams
  const allPosts = getAllPosts()
  const categories = getAllCategories()

  const posts = selectedCategory
    ? allPosts.filter((p) => p.category === selectedCategory)
    : allPosts

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">블로그</h1>
        <p className="text-gray-500">
          사주역학과 명리학에 관한 전문 아티클 {allPosts.length}편
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/blog"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
          }`}
        >
          전체 ({allPosts.length})
        </Link>
        {categories.map((cat) => {
          const count = allPosts.filter((p) => p.category === cat).length
          return (
            <Link
              key={cat}
              href={`/blog?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {cat} ({count})
            </Link>
          )
        })}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>해당 카테고리의 글이 없습니다.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

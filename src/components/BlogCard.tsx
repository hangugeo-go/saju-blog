import Link from 'next/link'
import { PostMeta } from '@/lib/posts'

interface BlogCardProps {
  post: PostMeta
  featured?: boolean
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <article
      className={`bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 overflow-hidden ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      <Link href={`/blog/${post.slug}`} className="block p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-gray-400">{post.readingTime} 읽기</span>
        </div>

        <h2
          className={`font-bold text-gray-900 mb-2 leading-snug line-clamp-2 ${
            featured ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
          }`}
        >
          {post.title}
        </h2>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
          {post.description}
        </p>

        <div className="flex items-center justify-between">
          <time className="text-xs text-gray-400">
            {new Date(post.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span className="text-indigo-500 text-sm font-medium">읽기 →</span>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  )
}

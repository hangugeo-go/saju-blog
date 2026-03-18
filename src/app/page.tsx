import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import BlogCard from '@/components/BlogCard'

const categories = [
  { name: '사주 기초', emoji: '📚', desc: '명리학의 기본 개념' },
  { name: '오행론', emoji: '🌊', desc: '목화토금수의 이치' },
  { name: '천간지지', emoji: '🔱', desc: '10천간 12지지 완전정복' },
  { name: '사주 실전', emoji: '🔮', desc: '실생활에 적용하는 사주' },
  { name: '궁합·인연', emoji: '💫', desc: '사람과 사람의 관계' },
  { name: '대운·세운', emoji: '📅', desc: '운의 흐름 읽기' },
]

export default function Home() {
  const posts = getAllPosts()
  const featuredPosts = posts.slice(0, 3)
  const recentPosts = posts.slice(3, 9)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-4">☯</div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            사주역학연구소
          </h1>
          <p className="text-indigo-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            동양철학의 정수, 명리학을 학문적으로 탐구합니다.
            <br className="hidden md:block" />
            천간지지부터 대운까지, 삶의 이치를 읽는 법을 알려드립니다.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/blog"
              className="bg-white text-indigo-900 font-bold px-6 py-3 rounded-full hover:bg-indigo-50 transition-colors"
            >
              글 읽기 시작하기
            </Link>
            <Link
              href="/about"
              className="border border-indigo-400 text-indigo-200 font-medium px-6 py-3 rounded-full hover:bg-indigo-800 transition-colors"
            >
              소개 보기
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 카테고리 */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-800 mb-5">주제별 탐색</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/blog?category=${encodeURIComponent(cat.name)}`}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all group"
              >
                <div className="text-2xl mb-2">{cat.emoji}</div>
                <div className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600">
                  {cat.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{cat.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* 최신 글 */}
        {featuredPosts.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">최신 글</h2>
              <Link href="/blog" className="text-sm text-indigo-500 hover:text-indigo-700">
                전체 보기 →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredPosts.map((post, i) => (
                <BlogCard key={post.slug} post={post} featured={i === 0} />
              ))}
            </div>
          </section>
        )}

        {recentPosts.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-bold text-gray-800 mb-5">더 많은 글</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {recentPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* CTA 배너 — 궁합분석 서비스 */}
        <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">☯</div>
          <h3 className="text-xl font-bold text-white mb-2">
            역학 궁합 분석 서비스 출시!
          </h3>
          <p className="text-indigo-200 text-sm mb-5 max-w-md mx-auto">
            사주팔자 · 자미두수 · 서양 점성술을 통합한 궁합 분석을 지금 바로 체험하세요.
            연애, 직장, 부모-자녀 관계 모두 지원합니다.
          </p>
          <Link
            href="/compatibility"
            className="bg-white text-indigo-900 font-bold px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors inline-block"
          >
            궁합 분석 시작하기 →
          </Link>
        </section>
      </div>
    </>
  )
}

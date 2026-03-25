import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { getAllPosts } from '@/lib/posts'
import BlogCard from '@/components/BlogCard'
import CompatibilityApp from '@/components/compat/CompatibilityApp'
import TodayPillarWidget from '@/components/TodayPillarWidget'
import DailyJournalWidget from '@/components/DailyJournalWidget'

const CATEGORY_KEYS = [
  { key: 'basics',        emoji: '📚', name: '사주 기초' },
  { key: 'five_elements', emoji: '🌊', name: '오행론' },
  { key: 'stems_branches',emoji: '🔱', name: '천간지지' },
  { key: 'practical',     emoji: '🔮', name: '사주 실전' },
  { key: 'compatibility', emoji: '💫', name: '궁합·인연' },
  { key: 'fortune',       emoji: '📅', name: '대운·세운' },
]

export default function Home() {
  const t  = useTranslations('home')
  const tc = useTranslations('categories')

  const posts        = getAllPosts()
  const recentPosts  = posts.slice(0, 6)

  return (
    <>
      {/* Hero = 궁합 입력 폼 직접 삽입 */}
      <CompatibilityApp embeddedMode={true} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 오늘의 일진 위젯 + 일진 기록 */}
        <section className="mb-10 space-y-3">
          <TodayPillarWidget />
          <DailyJournalWidget />
        </section>

        {/* 카테고리 */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-800 mb-5">{t('categories_title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORY_KEYS.map((cat) => (
              <Link
                key={cat.key}
                href={`/blog?category=${encodeURIComponent(cat.name)}`}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all group"
              >
                <div className="text-2xl mb-2">{cat.emoji}</div>
                <div className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600">
                  {tc(cat.key)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{tc(`${cat.key}_desc`)}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* 최신 글 */}
        {recentPosts.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">{t('latest_title')}</h2>
              <Link href="/blog" className="text-sm text-indigo-500 hover:text-indigo-700">
                {t('view_all')}
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {recentPosts.slice(0, 4).map((post, i) => (
                <BlogCard key={post.slug} post={post} featured={i === 0} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

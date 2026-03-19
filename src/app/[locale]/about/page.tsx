import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '소개',
  description: '사주역학연구소는 명리학과 사주역학의 학문적 이해를 돕는 전문 콘텐츠 블로그입니다.',
}

export default function AboutPage() {
  const t = useTranslations('about')

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('title')}</h1>
        <p className="text-gray-500 text-lg">{t('subtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
            ☯
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('org_name')}</h2>
            <p className="text-gray-500 text-sm">{t('org_desc')}</p>
          </div>
        </div>

        <div className="prose max-w-none">
          <h2>{t('what_we_do_title')}</h2>
          <p>{t('what_we_do')}</p>

          <h2>{t('content_title')}</h2>
          <ul>
            <li><strong>사주 기초</strong> — 명리학의 기본 개념부터 차근차근</li>
            <li><strong>오행론</strong> — 목화토금수의 상생·상극 원리</li>
            <li><strong>천간지지</strong> — 10천간 12지지 완전 해설</li>
            <li><strong>십성론</strong> — 비겁, 식상, 재성, 관성, 인성의 의미</li>
            <li><strong>대운·세운</strong> — 운의 흐름과 시기 읽기</li>
            <li><strong>사주 실전</strong> — 직업, 건강, 인간관계에 적용하기</li>
          </ul>

          <h2>{t('policy_title')}</h2>
          <p>{t('policy')}</p>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-6 text-center">
        <h3 className="font-bold text-gray-800 mb-2">{t('cta_question')}</h3>
        <p className="text-gray-500 text-sm mb-4">{t('cta_desc')}</p>
        <Link
          href="/contact"
          className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors inline-block"
        >
          {t('cta_btn')}
        </Link>
      </div>
    </div>
  )
}

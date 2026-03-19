import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ZiWeiApp from '@/components/ziwei/ZiWeiApp'

export const metadata: Metadata = {
  title: '자미두수 명반 분석 — 12궁 배치·주성 해석',
  description: '생년월일시를 입력하면 자미두수 명반(命盤)의 12궁 배치와 주요 별(14주성)의 의미를 분석합니다. 명궁·부처궁·관록궁 집중 해석.',
  keywords: ['자미두수', '명반', '명궁', '12궁', '주성', '자미두수분석', '사주'],
  openGraph: {
    title: '자미두수 명반 분석 — 12궁 배치·주성 해석',
    description: '자미두수 명반의 12궁과 14주성 배치를 분석합니다.',
    type: 'website',
  },
}

type Props = { params: Promise<{ locale: string }> }

export default async function ZiWeiPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ziwei' })

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-purple-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <h1 className="text-xl font-bold tracking-tight">{t('page_title')}</h1>
          <p className="text-purple-300 text-xs mt-0.5">{t('page_subtitle')}</p>
        </div>
      </div>
      <ZiWeiApp />
    </div>
  )
}

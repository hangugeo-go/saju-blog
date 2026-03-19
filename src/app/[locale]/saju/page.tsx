import type { Metadata } from 'next'
import SajuApp from '@/components/saju/SajuApp'

export const metadata: Metadata = {
  title: '사주팔자 분석 — 일주·오행·조후 용신',
  description: '생년월일시를 입력하면 사주팔자(연월일시주), 일간 성격 분석, 오행 분포, 조후 용신을 계산합니다. 명리학 기반 개인 역학 분석.',
  keywords: ['사주', '사주팔자', '일주', '오행', '용신', '십성', '사주분석', '명리학'],
  openGraph: {
    title: '사주팔자 분석 — 일주·오행·조후 용신',
    description: '생년월일시로 사주팔자와 일간 성격, 오행 분포를 분석합니다.',
    type: 'website',
  },
}

export default function SajuPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-ink-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <h1 className="text-xl font-bold tracking-tight">사주팔자 분석</h1>
          <p className="text-ink-400 text-xs mt-0.5">명리학 기반 · 일주·오행·조후 용신 통합 분석</p>
        </div>
      </div>
      <SajuApp />
    </div>
  )
}

import type { Metadata } from 'next'
import CompatibilityApp from '@/components/compat/CompatibilityApp'

export const metadata: Metadata = {
  title: '역학 궁합 분석 — 사주·자미두수·점성술 통합',
  description:
    '두 사람의 생년월일시를 입력하면 사주팔자, 자미두수, 서양 점성술을 통합한 역학 궁합 점수를 계산합니다. 연애·직장·부모자식 관계 분석 지원.',
  keywords: ['궁합', '사주궁합', '자미두수궁합', '점성술궁합', '연애궁합', '부부궁합', '직장궁합', '궁합분석'],
  openGraph: {
    title: '역학 궁합 분석 — 사주·자미두수·점성술 통합',
    description:
      '두 사람의 사주팔자와 자미두수, 서양 점성술을 통합 분석. 종합 궁합 점수와 시너지·처세 조언 제공.',
    type: 'website',
    images: [{ url: '/api/og?nameA=인물A&nameB=인물B&score=85&label=좋은궁합', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '역학 궁합 분석 — 사주·자미두수·점성술 통합',
    description: '사주팔자·자미두수·점성술 통합 궁합 점수를 무료로 확인하세요.',
    images: ['/api/og?nameA=인물A&nameB=인물B&score=85&label=좋은궁합'],
  },
}

export default function CompatibilityPage() {
  return <CompatibilityApp />
}

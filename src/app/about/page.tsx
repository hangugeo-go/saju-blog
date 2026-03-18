import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '소개',
  description:
    '사주역학연구소는 명리학과 사주역학의 학문적 이해를 돕는 전문 콘텐츠 블로그입니다.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">사주역학연구소 소개</h1>
        <p className="text-gray-500 text-lg">
          동양철학의 정수, 명리학을 현대적 시각으로 탐구합니다.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
            ☯
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">사주역학연구소</h2>
            <p className="text-gray-500 text-sm">명리학 전문 콘텐츠 블로그</p>
          </div>
        </div>

        <div className="prose max-w-none">
          <p>
            <strong>사주역학연구소</strong>는 수천 년의 역사를 지닌 동양철학, 그 중에서도
            명리학(사주역학)을 체계적이고 학문적으로 탐구하는 전문 블로그입니다.
          </p>

          <h2>우리가 하는 일</h2>
          <p>
            사주역학은 단순한 점술이 아닙니다. 천간(天干)과 지지(地支), 오행(五行)의 상생과
            상극 원리를 통해 자연의 이치와 인간의 삶을 연결하는 깊은 학문입니다.
            저희는 이 귀중한 지식을 누구나 이해할 수 있도록 풀어드립니다.
          </p>

          <h2>제공하는 콘텐츠</h2>
          <ul>
            <li><strong>사주 기초</strong> — 명리학의 기본 개념부터 차근차근</li>
            <li><strong>오행론</strong> — 목화토금수의 상생·상극 원리</li>
            <li><strong>천간지지</strong> — 10천간 12지지 완전 해설</li>
            <li><strong>십성론</strong> — 비겁, 식상, 재성, 관성, 인성의 의미</li>
            <li><strong>대운·세운</strong> — 운의 흐름과 시기 읽기</li>
            <li><strong>사주 실전</strong> — 직업, 건강, 인간관계에 적용하기</li>
          </ul>

          <h2>운영 방침</h2>
          <p>
            본 사이트의 모든 콘텐츠는 <strong>학술적·교육적 목적</strong>으로 작성됩니다.
            개인의 중요한 결정(투자, 의료, 법률 등)에 있어서는 반드시 해당 분야의
            전문가와 상담하시기 바랍니다.
          </p>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-6 text-center">
        <h3 className="font-bold text-gray-800 mb-2">궁금한 점이 있으신가요?</h3>
        <p className="text-gray-500 text-sm mb-4">문의 페이지를 통해 연락해 주세요.</p>
        <Link
          href="/contact"
          className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors inline-block"
        >
          문의하기
        </Link>
      </div>
    </div>
  )
}

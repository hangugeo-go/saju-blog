import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'Saju Lab의 개인정보처리방침입니다.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
      <p className="text-gray-400 text-sm mb-10">최종 업데이트: 2025년 1월 1일</p>

      <div className="prose max-w-none space-y-8">
        <section>
          <h2>1. 개요</h2>
          <p>
            Saju Lab(이하 &ldquo;본 사이트&rdquo;)는 이용자의 개인정보를 중요하게 여기며,
            개인정보보호법 및 관련 법령을 준수합니다. 본 방침은 본 사이트가 수집하는
            정보의 종류, 이용 방법 및 보호 방법에 대해 설명합니다.
          </p>
        </section>

        <section>
          <h2>2. 수집하는 정보</h2>
          <ul>
            <li><strong>자동 수집 정보</strong>: IP 주소, 브라우저 유형, 방문 페이지, 방문 시간 등의 로그 데이터</li>
            <li><strong>쿠키(Cookie)</strong>: 웹사이트 이용 분석 및 광고 최적화를 위한 쿠키</li>
            <li><strong>문의 양식</strong>: 이름, 이메일 주소, 문의 내용</li>
          </ul>
        </section>

        <section>
          <h2>3. 정보 이용 목적</h2>
          <ul>
            <li>서비스 운영 및 개선</li>
            <li>이용자 문의 응답</li>
            <li>통계 분석 및 사이트 성능 향상</li>
            <li>Google AdSense를 통한 맞춤형 광고 제공</li>
          </ul>
        </section>

        <section>
          <h2>4. Google AdSense 및 제3자 광고</h2>
          <p>
            본 사이트는 Google AdSense를 사용하여 광고를 게재합니다. Google은 귀하의
            브라우저에 쿠키를 사용하여 관련성 높은 광고를 표시합니다.
          </p>
        </section>

        <section>
          <h2>5. 쿠키 설정</h2>
          <p>
            브라우저 설정에서 쿠키를 거부하거나 삭제할 수 있으나, 일부 서비스 기능이 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2>6. 제3자 제공</h2>
          <p>법적 의무가 있는 경우를 제외하고는 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
        </section>

        <section>
          <h2>7. 문의</h2>
          <ul>
            <li>이메일: maisondesisy@gmail.com</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

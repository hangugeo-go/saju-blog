import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">☯</span>
              <span className="text-white font-bold text-base">사주역학연구소</span>
            </div>
            <p className="text-sm leading-relaxed">
              명리학과 사주역학의 학문적 이해를 돕는 전문 콘텐츠를 제공합니다.
              동양철학의 지혜를 현대적 시각으로 풀어드립니다.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">빠른 메뉴</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">홈</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">블로그</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">소개</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">문의</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">정보</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              <li>
                <a
                  href="mailto:contact@sajulab.com"
                  className="hover:text-white transition-colors"
                >
                  contact@sajulab.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-xs text-center">
          <p>© {year} 사주역학연구소. All rights reserved.</p>
          <p className="mt-1 text-gray-600">
            본 사이트의 콘텐츠는 학술적·교육적 목적으로 제공됩니다.
          </p>
        </div>
      </div>
    </footer>
  )
}

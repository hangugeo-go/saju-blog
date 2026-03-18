import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://sajulab.com'),
  title: {
    default: '사주역학연구소 - 명리학으로 보는 삶의 지혜',
    template: '%s | 사주역학연구소',
  },
  description:
    '사주역학과 명리학의 학문적 이해를 돕는 전문 블로그. 천간지지, 오행, 십성, 대운 등 사주의 기초부터 심화까지 체계적으로 알아보세요.',
  keywords: ['사주', '명리학', '사주역학', '운세', '천간지지', '오행', '십성', '대운', '사주풀이'],
  authors: [{ name: '사주역학연구소' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '사주역학연구소',
    title: '사주역학연구소 - 명리학으로 보는 삶의 지혜',
    description:
      '사주역학과 명리학의 학문적 이해를 돕는 전문 블로그. 천간지지, 오행, 십성부터 실생활 적용까지.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '사주역학연구소',
    description: '명리학으로 보는 삶의 지혜',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense - 승인 후 아래 주석 해제 및 ca-pub-XXXXXXXX 교체 */}
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        /> */}
      </head>
      <body className={`${notoSansKR.className} bg-gray-50 text-gray-900 antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileTabBar from '@/components/MobileTabBar'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://sajulab.com'),
  title: {
    default: 'Saju Lab - 명리학으로 보는 삶의 지혜',
    template: '%s | Saju Lab',
  },
  description:
    '사주역학과 명리학의 학문적 이해를 돕는 전문 블로그. 천간지지, 오행, 십성, 대운 등 사주의 기초부터 심화까지 체계적으로 알아보세요.',
  keywords: ['사주', '명리학', '사주역학', '운세', '천간지지', '오행', '십성', '대운', '사주풀이'],
  authors: [{ name: 'Saju Lab' }],
  openGraph: {
    type: 'website',
    siteName: 'Saju Lab',
    title: 'Saju Lab - 명리학으로 보는 삶의 지혜',
    description:
      '사주역학과 명리학의 학문적 이해를 돕는 전문 블로그. 천간지지, 오행, 십성부터 실생활 적용까지.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saju Lab',
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

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'ko' | 'en' | 'ja' | 'zh' | 'es')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        {/* Google AdSense - 승인 후 아래 주석 해제 및 ca-pub-XXXXXXXX 교체 */}
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        /> */}
        {/* Kakao JavaScript SDK */}
        <script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          async
        />
      </head>
      <body className={`${notoSansKR.className} bg-gray-50 text-gray-900 antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="min-h-screen pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileTabBar />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

const LOCALE_FLAGS: Record<string, string> = {
  ko: '🇰🇷', en: '🇺🇸', ja: '🇯🇵', zh: '🇨🇳', es: '🇪🇸',
}
const LOCALE_NAMES: Record<string, string> = {
  ko: '한국어', en: 'English', ja: '日本語', zh: '中文', es: 'Español',
}

export default function Header() {
  const t        = useTranslations('nav')
  const locale   = useLocale()
  const pathname = usePathname()
  const router   = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  const mainLinks = [
    { href: '/',      label: t('home'),    highlight: false },
    { href: '/blog',  label: t('blog'),    highlight: false },
    { href: '/about', label: t('about'),   highlight: false },
    { href: '/contact', label: t('contact'), highlight: false },
  ]
  const analysisLinks = [
    { href: '/saju',          label: t('saju'),   highlight: false },
    { href: '/ziwei',         label: t('ziwei'),  highlight: false },
    { href: '/compatibility', label: t('compat'), highlight: true  },
  ]

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next })
    setLangOpen(false)
    setMenuOpen(false)
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        {/* Left: Lang picker + Logo */}
        <div className="flex items-center gap-3">
          {/* Language dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md px-2 py-1 transition-colors"
            >
              <span>{LOCALE_FLAGS[locale]}</span>
              <span className="font-medium uppercase">{locale}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[130px] overflow-hidden">
                  {routing.locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => switchLocale(loc)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-indigo-50 transition-colors text-left ${
                        loc === locale ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <span>{LOCALE_FLAGS[loc]}</span>
                      <span>{LOCALE_NAMES[loc]}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">☯</span>
            <span className="font-bold text-xl text-gray-800 tracking-tight hidden sm:block">
              Saju Lab
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5">
          {mainLinks.slice(0, 2).map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors">
              {link.label}
            </Link>
          ))}

          {/* 분석 dropdown */}
          <div className="relative" onMouseLeave={() => setAnalysisOpen(false)}>
            <button
              onMouseEnter={() => setAnalysisOpen(true)}
              onClick={() => setAnalysisOpen(!analysisOpen)}
              className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors"
            >
              분석
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {analysisOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] overflow-hidden">
                {analysisLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setAnalysisOpen(false)}
                    className={`block px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors ${
                      link.highlight ? 'text-indigo-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {mainLinks.slice(2).map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-600 p-2"
          onClick={() => { setMenuOpen(!menuOpen); setLangOpen(false) }}
          aria-label="메뉴"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          {mainLinks.slice(0, 2).map((link) => (
            <Link key={link.href} href={link.href} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm font-medium" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}

          {/* 분석 그룹 */}
          <button
            onClick={() => setAnalysisOpen(!analysisOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            <span>분석</span>
            <svg className={`w-4 h-4 transition-transform ${analysisOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {analysisOpen && (
            <div className="bg-gray-50 border-t border-gray-100">
              {analysisLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => { setMenuOpen(false); setAnalysisOpen(false) }}
                  className={`block pl-8 pr-4 py-2.5 text-sm ${link.highlight ? 'text-indigo-700 font-semibold' : 'text-gray-600'} hover:bg-indigo-50`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {mainLinks.slice(2).map((link) => (
            <Link key={link.href} href={link.href} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm font-medium" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

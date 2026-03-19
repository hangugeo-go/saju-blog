'use client'

import { usePathname } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'

const TABS = [
  {
    href: '/',
    label: '홈',
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/saju',
    label: '사주',
    icon: (active: boolean) => (
      <span className={`text-xl leading-none ${active ? 'opacity-100' : 'opacity-40'}`}>☯</span>
    ),
  },
  {
    href: '/ziwei',
    label: '자미두수',
    icon: (active: boolean) => (
      <span className={`text-xl leading-none ${active ? 'opacity-100' : 'opacity-40'}`}>✦</span>
    ),
  },
  {
    href: '/compatibility',
    label: '궁합',
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

export default function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex">
        {TABS.map((tab) => {
          const active = tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors
                ${active ? 'text-indigo-600' : 'text-gray-400'}`}
            >
              {tab.icon(active)}
              <span className={`text-[10px] font-medium ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

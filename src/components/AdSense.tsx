'use client'

import { useEffect } from 'react'

interface AdSenseProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
}

// AdSense 클라이언트 ID - 승인 후 교체
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdSense({ slot, format = 'auto', className = '' }: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <div className={`adsense-container my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

// 배너형 광고 (728x90 or 반응형)
export function AdBanner({ className }: { className?: string }) {
  return <AdSense slot="XXXXXXXXXX" format="horizontal" className={className} />
}

// 인컨텐츠 광고 (콘텐츠 중간)
export function AdInContent({ className }: { className?: string }) {
  return <AdSense slot="YYYYYYYYYY" format="rectangle" className={className} />
}

// 사이드바 광고
export function AdSidebar({ className }: { className?: string }) {
  return <AdSense slot="ZZZZZZZZZZ" format="vertical" className={className} />
}

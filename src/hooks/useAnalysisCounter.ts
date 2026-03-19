'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'saju_analysis_count'
const SEED_COUNT  = 52341  // 시드 카운트 (실제 배포 후 증가)

export function useAnalysisCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setCount(stored ? parseInt(stored, 10) : SEED_COUNT)
    } catch {
      setCount(SEED_COUNT)
    }
  }, [])

  function increment() {
    setCount(prev => {
      const next = (prev ?? SEED_COUNT) + 1
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch {}
      return next
    })
  }

  return { count, increment }
}

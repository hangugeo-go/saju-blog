'use client'
import { useState, useEffect } from 'react'

const FALLBACK_COUNT = 52341

export function useAnalysisCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/counter')
      .then(r => r.json())
      .then(d => setCount(d.count ?? FALLBACK_COUNT))
      .catch(() => setCount(FALLBACK_COUNT))
  }, [])

  async function increment() {
    try {
      const res = await fetch('/api/counter', { method: 'POST' })
      const d   = await res.json()
      if (d.count) setCount(d.count)
      else setCount(prev => (prev ?? FALLBACK_COUNT) + 1)
    } catch {
      setCount(prev => (prev ?? FALLBACK_COUNT) + 1)
    }
  }

  return { count, increment }
}

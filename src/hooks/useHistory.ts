'use client'

import { useState, useCallback } from 'react'

const STORAGE_KEY = 'compat_history_v1'
const MAX_ITEMS   = 10

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useHistory() {
  const [history, setHistory] = useState(load)

  const saveResult = useCallback((formData: unknown, result: unknown) => {
    const fd = formData as Record<string, Record<string, string>>
    const r  = result  as Record<string, Record<string, number>>
    const item = {
      id:      Date.now(),
      date:    new Date().toISOString(),
      nameA:   fd?.personA?.name   || '인물A',
      nameB:   fd?.personB?.name   || '인물B',
      relType: fd?.relationType    || 'romantic',
      score:   r?.scores?.total    ?? null,
      formData,
      result
    }
    setHistory((prev: unknown[]) => {
      const next = [item, ...prev].slice(0, MAX_ITEMS)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* 스토리지 풀 */ }
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, saveResult, clearHistory }
}

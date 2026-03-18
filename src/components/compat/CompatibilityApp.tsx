'use client'

import { useState, useCallback } from 'react'
import InputForm from './InputForm'
import ResultDisplay from './ResultDisplay'
import HistoryPanel from './HistoryPanel'
import { useHistory } from '@/hooks/useHistory'

export default function CompatibilityApp() {
  const [result, setResult]     = useState(null)
  const [formData, setFormData] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)

  const { history, saveResult, clearHistory } = useHistory()

  async function handleAnalyze(data: unknown) {
    setLoading(true)
    setError(null)
    setResult(null)
    setFormData(data as null)

    try {
      const res  = await fetch('/api/compatibility', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '분석 실패')
      setResult(json.data)
      saveResult(data, json.data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError(null)
  }

  function handleRestore(item: { formData: unknown; result: unknown }) {
    setFormData(item.formData as null)
    setResult(item.result as null)
    setError(null)
  }

  const handleShare = useCallback(async () => {
    if (!result) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = result as any
    const nameA  = r?.persons?.A?.name  || '인물A'
    const nameB  = r?.persons?.B?.name  || '인물B'
    const score  = r?.scores?.total     ?? '?'
    const label  = r?.overall?.label    ?? ''
    const url    = window.location.href
    const text   = `${nameA} × ${nameB} 역학 궁합 분석\n종합 점수: ${score}점 (${label})\n\n${url}`

    if (navigator.share) {
      try { await navigator.share({ title: '역학 궁합 분석', text, url }); return } catch { /* 취소 */ }
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* 권한 없음 */ }
  }, [result])

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* 서비스 헤더 배너 */}
      <div className="bg-ink-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">역학 궁합 분석</h2>
            <p className="text-ink-400 text-xs mt-0.5">사주 · 자미두수 · 서양 점성술 통합 분석</p>
          </div>

          {result && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="text-xs text-ink-400 hover:text-white border border-ink-700 hover:border-ink-500 px-3 py-1.5 rounded transition-colors"
              >
                {copied ? '✓ 복사됨' : '🔗 공유'}
              </button>
              <button
                onClick={() => window.print()}
                className="text-xs text-ink-400 hover:text-white border border-ink-700 hover:border-ink-500 px-3 py-1.5 rounded transition-colors"
              >
                🖨 PDF
              </button>
              <button
                onClick={handleReset}
                className="text-xs text-ink-400 hover:text-white border border-ink-700 hover:border-ink-500 px-3 py-1.5 rounded transition-colors"
              >
                ← 새 분석
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!result && !loading && (
          <>
            <HistoryPanel
              history={history}
              onRestore={handleRestore}
              onClear={clearHistory}
            />
            <InputForm onSubmit={handleAnalyze} initialData={formData} />
          </>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-2 border-ink-300 border-t-ink-700 rounded-full animate-spin" />
            <p className="text-ink-500 text-sm">역학 데이터 분석 중...</p>
            <p className="text-ink-400 text-xs">사주 · 자미두수 · 절기 · 행성 위치 계산</p>
          </div>
        )}

        {error && (
          <div className="section-card border border-red-200 bg-red-50">
            <p className="text-red-700 font-medium">오류 발생</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button onClick={handleReset} className="mt-3 text-sm text-red-700 underline">
              다시 시도
            </button>
          </div>
        )}

        {result && <ResultDisplay data={result} />}
      </div>
    </div>
  )
}

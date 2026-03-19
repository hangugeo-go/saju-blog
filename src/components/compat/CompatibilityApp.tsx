// @ts-nocheck
'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import InputForm from './InputForm'
import ResultDisplay from './ResultDisplay'
import HistoryPanel from './HistoryPanel'
import { useHistory } from '@/hooks/useHistory'

export default function CompatibilityApp({ embeddedMode = false }) {
  const t = useTranslations('compat')
  const [result,   setResult]   = useState(null)
  const [formData, setFormData] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [copied,   setCopied]   = useState(false)
  const { history, saveResult, clearHistory } = useHistory()

  async function handleAnalyze(data) {
    setLoading(true); setError(null); setResult(null); setFormData(data)
    try {
      const res  = await fetch('/api/compatibility', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '분석 실패')
      setResult(json.data)
      saveResult(data, json.data)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  function handleReset() { setResult(null); setError(null) }
  function handleRestore(item) { setFormData(item.formData); setResult(item.result); setError(null) }

  const handleShare = useCallback(async () => {
    if (!result) return
    const r     = result
    const nameA = r?.persons?.A?.name || '인물A'
    const nameB = r?.persons?.B?.name || '인물B'
    const score = r?.scores?.total    ?? '?'
    const label = r?.overall?.label   ?? ''
    const url   = window.location.href
    const text  = t('share_text', { nameA, nameB, score, label, url })
    if (navigator.share) { try { await navigator.share({ title: t('share_title'), text, url }); return } catch {} }
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }, [result, t])

  if (embeddedMode) {
    return (
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-10">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">☯</div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('service_title')}</h1>
            <p className="text-indigo-300 text-sm mt-1">{t('service_subtitle')}</p>
          </div>
          {!result && !loading && (<><HistoryPanel history={history} onRestore={handleRestore} onClear={clearHistory} /><InputForm onSubmit={handleAnalyze} initialData={formData} /></>)}
          {loading && (<div className="flex flex-col items-center justify-center py-16 gap-4"><div className="w-10 h-10 border-2 border-indigo-400 border-t-white rounded-full animate-spin" /><p className="text-indigo-200 text-sm">{t('loading_title')}</p><p className="text-indigo-400 text-xs">{t('loading_desc')}</p></div>)}
          {error && (<div className="section-card border border-red-200 bg-red-50 mt-4"><p className="text-red-700 font-medium">{t('error_title')}</p><p className="text-red-600 text-sm mt-1">{error}</p><button onClick={handleReset} className="mt-3 text-sm text-red-700 underline">{t('error_retry')}</button></div>)}
        </div>
        {result && (<div className="bg-ink-50"><div className="max-w-4xl mx-auto px-4 py-6"><div className="flex justify-end gap-2 mb-4"><button onClick={handleShare} className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded">{copied ? t('copied') : t('share')}</button><button onClick={() => window.print()} className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded">{t('pdf')}</button><button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded">{t('new_analysis')}</button></div><ResultDisplay data={result} /></div></div>)}
      </div>
    )
  }

  return (
    <div className="bg-ink-50 min-h-screen">
      <div className="bg-ink-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div><h2 className="text-xl font-bold tracking-tight">{t('service_title')}</h2><p className="text-ink-400 text-xs mt-0.5">{t('service_subtitle')}</p></div>
          {result && (<div className="flex items-center gap-2"><button onClick={handleShare} className="text-xs text-ink-400 hover:text-white border border-ink-700 hover:border-ink-500 px-3 py-1.5 rounded transition-colors">{copied ? t('copied') : t('share')}</button><button onClick={() => window.print()} className="text-xs text-ink-400 hover:text-white border border-ink-700 hover:border-ink-500 px-3 py-1.5 rounded transition-colors">{t('pdf')}</button><button onClick={handleReset} className="text-xs text-ink-400 hover:text-white border border-ink-700 hover:border-ink-500 px-3 py-1.5 rounded transition-colors">{t('new_analysis')}</button></div>)}
        </div>
      </div>
      {result && (<div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex items-center justify-around px-4 py-2 shadow-lg print:hidden"><button onClick={handleShare} className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-indigo-600 text-xs"><span className="text-lg">{copied ? '✓' : '🔗'}</span><span>{copied ? t('copied') : t('share')}</span></button><button onClick={() => window.print()} className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-indigo-600 text-xs"><span className="text-lg">🖨</span><span>{t('pdf')}</span></button><button onClick={handleReset} className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-indigo-600 text-xs"><span className="text-lg">✦</span><span>{t('new_analysis')}</span></button></div>)}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!result && !loading && (<><HistoryPanel history={history} onRestore={handleRestore} onClear={clearHistory} /><InputForm onSubmit={handleAnalyze} initialData={formData} /></>)}
        {loading && (<div className="flex flex-col items-center justify-center py-32 gap-4"><div className="w-10 h-10 border-2 border-ink-300 border-t-ink-700 rounded-full animate-spin" /><p className="text-ink-500 text-sm">{t('loading_title')}</p><p className="text-ink-400 text-xs">{t('loading_desc')}</p></div>)}
        {error && (<div className="section-card border border-red-200 bg-red-50"><p className="text-red-700 font-medium">{t('error_title')}</p><p className="text-red-600 text-sm mt-1">{error}</p><button onClick={handleReset} className="mt-3 text-sm text-red-700 underline">{t('error_retry')}</button></div>)}
        {result && <ResultDisplay data={result} />}
      </div>
    </div>
  )
}

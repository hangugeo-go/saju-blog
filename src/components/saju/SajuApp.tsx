// @ts-nocheck
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_BRANCH = ['자시(子)', '축시(丑)', '인시(寅)', '묘시(卯)', '진시(辰)', '사시(巳)', '오시(午)', '미시(未)', '신시(申)', '유시(酉)', '술시(戌)', '해시(亥)']
function getHourBranchLabel(h: number) {
  const idx = Math.floor(((h + 1) % 24) / 2)
  return HOUR_BRANCH[idx] || ''
}

const ELEMENTS_KR = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)']
const ELEM_COLORS = ['text-green-700', 'text-red-600', 'text-yellow-700', 'text-gray-600', 'text-blue-700']

function PillarCard({ label, ganzhi, nayin }: { label: string; ganzhi: string; nayin?: string }) {
  return (
    <div className="flex flex-col items-center bg-white border border-ink-200 rounded-lg p-3 min-w-[72px]">
      <span className="text-xs text-ink-400 mb-1">{label}</span>
      <span className="text-2xl font-bold text-ink-800 tracking-widest">{ganzhi}</span>
      {/* nayin 숨김: 일반 사용자에게 너무 전문적 */}
    </div>
  )
}

function ElementBar({ count, total, label, colorClass }: { count: number; total: number; label: string; colorClass: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-16 font-medium ${colorClass}`}>{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${colorClass.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-ink-500">{count}</span>
    </div>
  )
}

export default function SajuApp() {
  const t = useTranslations('saju')
  const [form, setForm] = useState({ name: '', year: '', month: '', day: '', hour: '12', minute: '0', hourUnknown: false, calendarType: 'solar', isLeapMonth: false })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/saju', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || t('error_default'))
      setResult(json.data)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  function handleReset() { setResult(null); setError(null) }

  if (result) {
    const { pillars, dayMaster, elementCount, johu, kongwang, interpretation, inputName, _lunarOriginal } = result
    const { dayMasterProfile, elementAdvice } = interpretation || {}
    const totalElem = (elementCount || []).reduce((a, b) => a + b, 0)

    const allPillars = [
      { label: t('pillar_year'), gz: pillars?.year },
      { label: t('pillar_month'), gz: pillars?.month },
      { label: t('pillar_day'), gz: pillars?.day },
      ...(pillars?.hour ? [{ label: t('pillar_hour'), gz: pillars.hour }] : []),
    ]

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 헤더 */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-ink-800">
              {inputName ? t('result_title_named', { name: inputName }) : t('result_title')}
            </h2>
            <button onClick={handleReset} className="text-xs text-ink-400 hover:text-ink-700 border border-ink-200 px-3 py-1 rounded">
              {t('reset')}
            </button>
          </div>
          {_lunarOriginal && <p className="text-xs text-amber-600">{t('lunar_original')} {_lunarOriginal}</p>}
        </div>

        {/* 사주팔자 */}
        <div className="section-card">
          <h3 className="text-sm font-semibold text-ink-600 mb-3">{t('section_pillars')}</h3>
          <div className="flex gap-3 justify-center flex-wrap">
            {allPillars.map(({ label, gz }) => (
              <PillarCard
                key={label}
                label={label}
                ganzhi={`${gz?.stemKr || '?'}${gz?.branchKr || '?'}`}
                nayin={gz?.nayin}
              />
            ))}
          </div>
          <div className="mt-3 text-center">
            <span className="text-sm text-ink-500">{t('day_master_label')} </span>
            <span className="font-semibold text-ink-800">{dayMaster?.stemKr}{dayMaster?.branchKr || ''} — {dayMaster?.element} {dayMaster?.yinYang}</span>
          </div>
        </div>

        {/* 일간 프로파일 */}
        {dayMasterProfile && (
          <div className="section-card">
            <h3 className="text-sm font-semibold text-ink-600 mb-3">{t('section_day_master')} — {dayMasterProfile.nickname}</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-ink-700">{t('label_personality')}: </span>
                <span className="text-ink-600">{dayMasterProfile.personality}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-100 rounded p-2">
                  <p className="text-xs font-semibold text-green-700 mb-1">{t('label_strengths')}</p>
                  <p className="text-xs text-green-900">{dayMasterProfile.strengths}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded p-2">
                  <p className="text-xs font-semibold text-red-700 mb-1">{t('label_weaknesses')}</p>
                  <p className="text-xs text-red-900">{dayMasterProfile.weaknesses}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-ink-700">{t('label_career')}: </span>
                <span className="text-ink-600">{dayMasterProfile.career}</span>
              </div>
              <div>
                <span className="font-medium text-ink-700">{t('label_relationship')}: </span>
                <span className="text-ink-600">{dayMasterProfile.relationship}</span>
              </div>
            </div>
          </div>
        )}

        {/* 오행 분포 */}
        <div className="section-card">
          <h3 className="text-sm font-semibold text-ink-600 mb-3">{t('section_elements')}</h3>
          <div className="space-y-2">
            {(elementCount || []).map((cnt, i) => (
              <ElementBar key={i} count={cnt} total={totalElem} label={ELEMENTS_KR[i]} colorClass={ELEM_COLORS[i]} />
            ))}
          </div>
          {elementAdvice?.length > 0 && (
            <div className="mt-3 space-y-2">
              {elementAdvice.map((adv, i) => (
                <div key={i} className="text-xs bg-amber-50 border border-amber-100 rounded p-2 text-amber-900">{adv}</div>
              ))}
            </div>
          )}
        </div>

        {/* 조후 용신 */}
        {johu && (
          <div className="section-card">
            <h3 className="text-sm font-semibold text-ink-600 mb-2">{t('section_johu')}</h3>
            <p className="text-sm text-ink-600">
              {t('johu_needs')}: <span className="font-medium text-ink-800">{johu.needs?.join(', ') || t('johu_none')}</span>
            </p>
            <p className="text-sm text-ink-500 mt-1">{johu.comment}</p>
          </div>
        )}

        {/* 공망 */}
        {kongwang?.length > 0 && (
          <div className="section-card">
            <h3 className="text-sm font-semibold text-ink-600 mb-2">{t('section_kongwang')}</h3>
            <p className="text-sm text-ink-600">
              <span className="font-medium">{kongwang.join(', ')}</span>
              <span className="text-ink-400 ml-2">— {t('kongwang_desc')}</span>
            </p>
          </div>
        )}

        {/* 신뢰도 */}
        <div className="text-xs text-ink-400 text-center">
          {t('reliability_label')}: {result.reliability}% {result.reliability < 80 ? t('reliability_no_hour') : ''}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="section-card">
        <h2 className="text-lg font-bold text-ink-800 mb-1">{t('title')}</h2>
        <p className="text-sm text-ink-500 mb-5">{t('subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">{t('form_name')}</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('form_name_placeholder')} className="w-full border border-ink-200 rounded px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">{t('form_calendar')}</label>
            <div className="flex gap-2">
              {['solar', 'lunar'].map(tp => (
                <button key={tp} type="button" onClick={() => set('calendarType', tp)}
                  className={`px-3 py-1.5 text-sm rounded border ${form.calendarType === tp ? 'bg-indigo-600 text-white border-indigo-600' : 'border-ink-200 text-ink-600'}`}>
                  {tp === 'solar' ? t('form_solar') : t('form_lunar')}
                </button>
              ))}
              {form.calendarType === 'lunar' && (
                <label className="flex items-center gap-1 text-sm text-ink-600">
                  <input type="checkbox" checked={form.isLeapMonth} onChange={e => set('isLeapMonth', e.target.checked)} />
                  {t('form_leap')}
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-ink-500 mb-1">{t('form_year')}</label>
              <input value={form.year} onChange={e => set('year', e.target.value)} placeholder="1990" required className="w-full border border-ink-200 rounded px-2 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-ink-500 mb-1">{t('form_month')}</label>
              <input value={form.month} onChange={e => set('month', e.target.value)} placeholder="6" required className="w-full border border-ink-200 rounded px-2 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-ink-500 mb-1">{t('form_day')}</label>
              <input value={form.day} onChange={e => set('day', e.target.value)} placeholder="15" required className="w-full border border-ink-200 rounded px-2 py-2 text-sm" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-ink-700">{t('form_time')}</label>
              <label className="flex items-center gap-1 text-xs text-ink-500">
                <input type="checkbox" checked={form.hourUnknown} onChange={e => set('hourUnknown', e.target.checked)} />
                {t('form_unknown')}
              </label>
            </div>
            {!form.hourUnknown && (
              <div className="flex gap-2 items-center">
                <select value={form.hour} onChange={e => set('hour', e.target.value)} className="border border-ink-200 rounded px-2 py-2 text-sm">
                  {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}시</option>)}
                </select>
                <select value={form.minute} onChange={e => set('minute', e.target.value)} className="border border-ink-200 rounded px-2 py-2 text-sm">
                  {[0, 10, 20, 30, 40, 50].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}분</option>)}
                </select>
                <span className="text-xs text-ink-400">{getHourBranchLabel(parseInt(form.hour))}</span>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            {loading ? t('form_loading') : t('form_submit')}
          </button>
        </form>
      </div>
    </div>
  )
}

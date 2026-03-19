// @ts-nocheck
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_BRANCH = ['자시(子)', '축시(丑)', '인시(寅)', '묘시(卯)', '진시(辰)', '사시(巳)', '오시(午)', '미시(未)', '신시(申)', '유시(酉)', '술시(戌)', '해시(亥)']
function getHourBranchLabel(h) {
  const idx = Math.floor(((h + 1) % 24) / 2)
  return HOUR_BRANCH[idx] || ''
}

const ELEM_COLOR = {
  0: 'bg-green-100 text-green-800',
  1: 'bg-red-100 text-red-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-gray-100 text-gray-700',
  4: 'bg-blue-100 text-blue-800',
}

const KEY_PALACE_IDX = [0, 2, 8, 7, 10]

export default function ZiWeiApp() {
  const t = useTranslations('ziwei')
  const [form, setForm] = useState({ name: '', year: '', month: '', day: '', hour: '12', minute: '0', hourUnknown: false, calendarType: 'solar', isLeapMonth: false })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/ziwei', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || t('error_default'))
      setResult(json.data)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  function handleReset() { setResult(null); setError(null) }

  if (result) {
    const { palacesWithStars, interpretation, inputName, _lunarOriginal, lifePalaceBranch, bodyPalaceBranch, lunarDate, reliability } = result
    const { lifePalaceProfile, primaryStar, allLifeStars, spouseStars, careerStars } = interpretation || {}

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
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
          <div className="flex gap-4 text-sm mt-2">
            <span className="text-ink-500">{t('life_palace_label')}: <strong className="text-ink-800">{lifePalaceBranch}</strong></span>
            <span className="text-ink-500">{t('body_palace_label')}: <strong className="text-ink-800">{bodyPalaceBranch}</strong></span>
            {lunarDate && <span className="text-ink-400 text-xs">{t('lunar_date', { month: lunarDate.month, day: lunarDate.day })}</span>}
          </div>
        </div>

        <div className="flex gap-2">
          {['overview', 'chart'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm rounded-full border ${activeTab === tab ? 'bg-indigo-600 text-white border-indigo-600' : 'border-ink-200 text-ink-600 hover:border-indigo-400'}`}>
              {tab === 'overview' ? t('tab_overview') : t('tab_chart')}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {lifePalaceProfile && (
              <div className="section-card">
                <h3 className="text-sm font-semibold text-ink-600 mb-3">{t('section_life_profile', { branch: lifePalaceBranch })}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-ink-700">{lifePalaceProfile.personality}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-green-50 border border-green-100 rounded p-2">
                      <p className="text-xs font-semibold text-green-700 mb-0.5">{t('label_strengths')}</p>
                      <p className="text-xs text-green-900">{lifePalaceProfile.strengths}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded p-2">
                      <p className="text-xs font-semibold text-amber-700 mb-0.5">{t('label_challenges')}</p>
                      <p className="text-xs text-amber-900">{lifePalaceProfile.challenges}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {primaryStar && (
              <div className="section-card">
                <h3 className="text-sm font-semibold text-ink-600 mb-3">{t('section_primary_star', { star: primaryStar.kr + '(' + primaryStar.name + ')' })}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-ink-700">{primaryStar.lifeMeaning}</p>
                  {primaryStar.careerHint && (
                    <p className="text-ink-500"><span className="font-medium text-ink-700">{t('primary_career')}:</span> {primaryStar.careerHint}</p>
                  )}
                  {primaryStar.relationshipHint && (
                    <p className="text-ink-500"><span className="font-medium text-ink-700">{t('primary_relationship')}:</span> {primaryStar.relationshipHint}</p>
                  )}
                </div>
                {allLifeStars && allLifeStars.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {allLifeStars.map(s => (
                      <span key={s.key} className={`text-xs px-2 py-0.5 rounded-full ${ELEM_COLOR[s.element] || 'bg-gray-100'}`}>
                        {s.kr} — {s.desc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!primaryStar && (
              <div className="section-card">
                <h3 className="text-sm font-semibold text-ink-600 mb-2">{t('section_empty_palace')}</h3>
                <p className="text-sm text-ink-500">{t('empty_palace_desc')}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="section-card">
                <h3 className="text-sm font-semibold text-ink-600 mb-2">{t('section_spouse')}</h3>
                {spouseStars && spouseStars.length > 0 ? (
                  <div className="space-y-1">
                    {spouseStars.map(s => (
                      <div key={s.key} className="text-xs">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-1 ${ELEM_COLOR[s.element] || 'bg-gray-100'}`}>{s.kr}</span>
                        <span className="text-ink-500">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-ink-400">{t('spouse_empty')}</p>}
              </div>
              <div className="section-card">
                <h3 className="text-sm font-semibold text-ink-600 mb-2">{t('section_career')}</h3>
                {careerStars && careerStars.length > 0 ? (
                  <div className="space-y-1">
                    {careerStars.map(s => (
                      <div key={s.key} className="text-xs">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-1 ${ELEM_COLOR[s.element] || 'bg-gray-100'}`}>{s.kr}</span>
                        <span className="text-ink-500">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-ink-400">{t('career_empty')}</p>}
              </div>
            </div>
          </>
        )}

        {activeTab === 'chart' && (
          <div className="section-card">
            <h3 className="text-sm font-semibold text-ink-600 mb-3">{t('section_chart')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {(palacesWithStars || []).map(p => (
                <div key={p.idx}
                  className={`border rounded-lg p-2 text-xs ${KEY_PALACE_IDX.includes(p.idx) ? 'border-indigo-300 bg-indigo-50' : 'border-ink-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-ink-700">{p.kr}</span>
                    <span className="text-ink-400">{p.branchKr}</span>
                  </div>
                  {p.stars && p.stars.length > 0 ? (
                    <div className="flex flex-wrap gap-0.5">
                      {p.stars.map(s => (
                        <span key={s.key} className={`px-1 py-0.5 rounded text-xs ${ELEM_COLOR[s.element] || 'bg-gray-100'}`}>{s.kr}</span>
                      ))}
                    </div>
                  ) : <span className="text-ink-300">{t('empty_palace_badge')}</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-400 mt-2">{t('chart_legend')}</p>
          </div>
        )}

        <div className="text-xs text-ink-400 text-center">
          {t('reliability_label')}: {reliability}% {reliability < 80 ? t('reliability_no_hour') : ''}
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

          <button type="submit" disabled={loading} className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            {loading ? t('form_loading') : t('form_submit')}
          </button>
        </form>
      </div>
    </div>
  )
}

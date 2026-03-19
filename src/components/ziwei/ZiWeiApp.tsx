// @ts-nocheck
'use client'

import { useState } from 'react'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_BRANCH = ['자시(子)', '축시(丑)', '인시(寅)', '묘시(卯)', '진시(辰)', '사시(巳)', '오시(午)', '미시(未)', '신시(申)', '유시(酉)', '술시(戌)', '해시(亥)']
function getHourBranchLabel(h: number) {
  const idx = Math.floor(((h + 1) % 24) / 2)
  return HOUR_BRANCH[idx] || ''
}

const ELEM_COLOR: Record<number, string> = {
  0: 'bg-green-100 text-green-800',
  1: 'bg-red-100 text-red-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-gray-100 text-gray-700',
  4: 'bg-blue-100 text-blue-800',
}

const PALACE_NAMES = ['명궁', '형제궁', '부처궁', '자녀궁', '재백궁', '질액궁', '천이궁', '노복궁', '관록궁', '전택궁', '복덕궁', '부모궁']
const KEY_PALACE_IDX = [0, 2, 8, 7, 10]  // 명궁, 부처궁, 관록궁, 노복궁, 복덕궁

export default function ZiWeiApp() {
  const [form, setForm] = useState({ name: '', year: '', month: '', day: '', hour: '12', minute: '0', hourUnknown: false, calendarType: 'solar', isLeapMonth: false })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'chart'>('overview')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/ziwei', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '분석 실패')
      setResult(json.data)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  function handleReset() { setResult(null); setError(null) }

  if (result) {
    const { palacesWithStars, interpretation, inputName, _lunarOriginal, lifePalaceBranch, bodyPalaceBranch, lunarDate, reliability } = result
    const { lifePalaceProfile, primaryStar, allLifeStars, spouseStars, careerStars } = interpretation || {}

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 헤더 */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-ink-800">
              {inputName ? `${inputName}님의 ` : ''}자미두수 명반
            </h2>
            <button onClick={handleReset} className="text-xs text-ink-400 hover:text-ink-700 border border-ink-200 px-3 py-1 rounded">
              다시 분석
            </button>
          </div>
          {_lunarOriginal && <p className="text-xs text-amber-600">음력 원본: {_lunarOriginal}</p>}
          <div className="flex gap-4 text-sm mt-2">
            <span className="text-ink-500">명궁: <strong className="text-ink-800">{lifePalaceBranch}</strong></span>
            <span className="text-ink-500">신궁: <strong className="text-ink-800">{bodyPalaceBranch}</strong></span>
            {lunarDate && <span className="text-ink-400 text-xs">음력 {lunarDate.month}월 {lunarDate.day}일 기준</span>}
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2">
          {(['overview', 'chart'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 text-sm rounded-full border ${activeTab === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-ink-200 text-ink-600 hover:border-indigo-400'}`}>
              {t === 'overview' ? '명반 해석' : '12궁 배치'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* 명궁 지지 프로파일 */}
            {lifePalaceProfile && (
              <div className="section-card">
                <h3 className="text-sm font-semibold text-ink-600 mb-3">명궁(命宮) 지지 분석 — {lifePalaceBranch}궁</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-ink-700">{lifePalaceProfile.personality}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-green-50 border border-green-100 rounded p-2">
                      <p className="text-xs font-semibold text-green-700 mb-0.5">강점</p>
                      <p className="text-xs text-green-900">{lifePalaceProfile.strengths}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded p-2">
                      <p className="text-xs font-semibold text-amber-700 mb-0.5">과제</p>
                      <p className="text-xs text-amber-900">{lifePalaceProfile.challenges}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 명궁 주성 */}
            {primaryStar && (
              <div className="section-card">
                <h3 className="text-sm font-semibold text-ink-600 mb-3">명궁 주성 — {primaryStar.kr}({primaryStar.name})</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-ink-700">{primaryStar.lifeMeaning}</p>
                  {primaryStar.careerHint && (
                    <p className="text-ink-500"><span className="font-medium text-ink-700">적합 직군:</span> {primaryStar.careerHint}</p>
                  )}
                  {primaryStar.relationshipHint && (
                    <p className="text-ink-500"><span className="font-medium text-ink-700">대인관계:</span> {primaryStar.relationshipHint}</p>
                  )}
                </div>
                {allLifeStars.length > 1 && (
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
                <h3 className="text-sm font-semibold text-ink-600 mb-2">명궁 — 공궁(空宮)</h3>
                <p className="text-sm text-ink-500">명궁에 주성이 없는 공궁입니다. 대궁(천이궁)의 별을 참고하여 해석하며, 환경의 영향을 많이 받는 유형입니다.</p>
              </div>
            )}

            {/* 부처궁·관록궁 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="section-card">
                <h3 className="text-sm font-semibold text-ink-600 mb-2">부처궁(夫妻宮)</h3>
                {spouseStars?.length > 0 ? (
                  <div className="space-y-1">
                    {spouseStars.map(s => (
                      <div key={s.key} className="text-xs">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-1 ${ELEM_COLOR[s.element] || 'bg-gray-100'}`}>{s.kr}</span>
                        <span className="text-ink-500">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-ink-400">공궁 — 배우자 인연에 유연성</p>}
              </div>
              <div className="section-card">
                <h3 className="text-sm font-semibold text-ink-600 mb-2">관록궁(官祿宮)</h3>
                {careerStars?.length > 0 ? (
                  <div className="space-y-1">
                    {careerStars.map(s => (
                      <div key={s.key} className="text-xs">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-1 ${ELEM_COLOR[s.element] || 'bg-gray-100'}`}>{s.kr}</span>
                        <span className="text-ink-500">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-ink-400">공궁 — 직업 변동 잦거나 자유업 적합</p>}
              </div>
            </div>
          </>
        )}

        {activeTab === 'chart' && (
          <div className="section-card">
            <h3 className="text-sm font-semibold text-ink-600 mb-3">12궁(宮) 배치도</h3>
            <div className="grid grid-cols-3 gap-2">
              {(palacesWithStars || []).map(p => (
                <div key={p.idx}
                  className={`border rounded-lg p-2 text-xs ${KEY_PALACE_IDX.includes(p.idx) ? 'border-indigo-300 bg-indigo-50' : 'border-ink-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-ink-700">{p.kr}</span>
                    <span className="text-ink-400">{p.branchKr}</span>
                  </div>
                  {p.stars?.length > 0 ? (
                    <div className="flex flex-wrap gap-0.5">
                      {p.stars.map(s => (
                        <span key={s.key} className={`px-1 py-0.5 rounded text-xs ${ELEM_COLOR[s.element] || 'bg-gray-100'}`}>{s.kr}</span>
                      ))}
                    </div>
                  ) : <span className="text-ink-300">공궁</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-400 mt-2">파란 테두리: 명궁·부처궁·관록궁·노복궁·복덕궁 핵심 5궁</p>
          </div>
        )}

        {/* 신뢰도 */}
        <div className="text-xs text-ink-400 text-center">
          분석 신뢰도: {reliability}% {reliability < 80 ? '(출생 시간 미입력으로 시주 추정)' : ''}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="section-card">
        <h2 className="text-lg font-bold text-ink-800 mb-1">자미두수 명반 분석</h2>
        <p className="text-sm text-ink-500 mb-5">생년월일시를 입력하면 12궁 배치와 주요 별의 해석을 제공합니다.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">이름 (선택)</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="홍길동" className="w-full border border-ink-200 rounded px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">달력 방식</label>
            <div className="flex gap-2">
              {['solar', 'lunar'].map(t => (
                <button key={t} type="button" onClick={() => set('calendarType', t)}
                  className={`px-3 py-1.5 text-sm rounded border ${form.calendarType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-ink-200 text-ink-600'}`}>
                  {t === 'solar' ? '양력' : '음력'}
                </button>
              ))}
              {form.calendarType === 'lunar' && (
                <label className="flex items-center gap-1 text-sm text-ink-600">
                  <input type="checkbox" checked={form.isLeapMonth} onChange={e => set('isLeapMonth', e.target.checked)} />
                  윤달
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-ink-500 mb-1">연도</label>
              <input value={form.year} onChange={e => set('year', e.target.value)} placeholder="1990" required className="w-full border border-ink-200 rounded px-2 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-ink-500 mb-1">월</label>
              <input value={form.month} onChange={e => set('month', e.target.value)} placeholder="6" required className="w-full border border-ink-200 rounded px-2 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-ink-500 mb-1">일</label>
              <input value={form.day} onChange={e => set('day', e.target.value)} placeholder="15" required className="w-full border border-ink-200 rounded px-2 py-2 text-sm" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-ink-700">출생 시간</label>
              <label className="flex items-center gap-1 text-xs text-ink-500">
                <input type="checkbox" checked={form.hourUnknown} onChange={e => set('hourUnknown', e.target.checked)} />
                모름
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
            {loading ? '분석 중...' : '자미두수 명반 분석 시작'}
          </button>
        </form>
      </div>
    </div>
  )
}

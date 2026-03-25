'use client'

import { useState, useEffect } from 'react'
import { getTodayGanzhi } from '@/lib/saju/todayGanzhi'

// 오행 상생·상극 관계
const PRODUCES = [1, 2, 3, 4, 0] // 목→화→토→금→수→목
const CONTROLS = [2, 3, 4, 0, 1] // 목→토, 화→금, 토→수, 금→목, 수→화

function getRelation(myElem: number, todayElem: number) {
  if (myElem === todayElem)
    return { text: '비화(比和) — 같은 기운, 자신을 돌아보기 좋은 날', color: 'text-gray-600' }
  if (PRODUCES[myElem] === todayElem)
    return { text: '내가 생(生)하는 날 — 에너지를 나눠주는 날', color: 'text-green-700' }
  if (PRODUCES[todayElem] === myElem)
    return { text: '생(生)을 받는 날 — 기운이 채워지는 날', color: 'text-indigo-600' }
  if (CONTROLS[myElem] === todayElem)
    return { text: '내가 극(克)하는 날 — 주도적으로 이끄는 날', color: 'text-amber-600' }
  return { text: '극(克)을 받는 날 — 마찰에 주의가 필요한 날', color: 'text-red-600' }
}

interface JournalEntry {
  date: string      // YYYY-MM-DD
  ganzhi: string    // 일주 한자
  ganzhiKr: string  // 일주 한글
  note: string
}

interface UserSaju {
  birth: { year: number; month: number; day: number }
  dayMaster: { stemKr: string; stem: string; elementIdx: number; element: string }
}

export default function DailyJournalWidget() {
  const [isOpen, setIsOpen]     = useState(false)
  const [userSaju, setUserSaju] = useState<UserSaju | null>(null)
  const [entries, setEntries]   = useState<JournalEntry[]>([])
  const [note, setNote]         = useState('')
  const [birthForm, setBirthForm] = useState({ year: '', month: '', day: '' })
  const [loading, setLoading]   = useState(false)
  const [savedToday, setSavedToday] = useState(false)

  const today    = getTodayGanzhi()
  const todayStr = `${today.date.year}-${String(today.date.month).padStart(2,'0')}-${String(today.date.day).padStart(2,'0')}`

  useEffect(() => {
    const storedSaju = localStorage.getItem('journal_saju')
    if (storedSaju) setUserSaju(JSON.parse(storedSaju))

    const storedEntries: JournalEntry[] = JSON.parse(localStorage.getItem('journal_entries') || '[]')
    setEntries(storedEntries)

    const todayEntry = storedEntries.find(e => e.date === todayStr)
    if (todayEntry) { setNote(todayEntry.note); setSavedToday(true) }
  }, [todayStr])

  async function handleSaveBirth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: birthForm.year, month: birthForm.month, day: birthForm.day,
          hourUnknown: true, calendarType: 'solar',
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error()
      const saju: UserSaju = {
        birth: { year: +birthForm.year, month: +birthForm.month, day: +birthForm.day },
        dayMaster: {
          stemKr:     json.data.dayMaster.stemKr,
          stem:       json.data.dayMaster.stem,
          elementIdx: json.data.dayMaster.elementIdx,
          element:    json.data.dayMaster.element,
        },
      }
      localStorage.setItem('journal_saju', JSON.stringify(saju))
      setUserSaju(saju)
    } catch {
      alert('사주 계산 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function handleSaveNote() {
    if (!note.trim()) return
    const entry: JournalEntry = {
      date:      todayStr,
      ganzhi:    today.day.ganzhi,
      ganzhiKr:  `${today.day.stemKr}${today.day.branchKr}`,
      note:      note.trim(),
    }
    const updated = [entry, ...entries.filter(e => e.date !== todayStr)].slice(0, 60)
    setEntries(updated)
    localStorage.setItem('journal_entries', JSON.stringify(updated))
    setSavedToday(true)
  }

  function handleReset() {
    if (!confirm('내 사주 정보를 초기화할까요?')) return
    localStorage.removeItem('journal_saju')
    setUserSaju(null)
    setBirthForm({ year: '', month: '', day: '' })
  }

  const relation = userSaju
    ? getRelation(userSaju.dayMaster.elementIdx, today.day.stemElem)
    : null

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📔</span>
          <span className="text-sm font-semibold text-gray-700">일진 기록하기</span>
          {savedToday && (
            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
              오늘 기록 완료
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">

          {/* ① 내 사주 설정 */}
          {!userSaju ? (
            <div>
              <p className="text-xs text-gray-500 mb-3">
                내 생년월일을 입력하면 오늘 일진과의 오행 관계를 알려드려요
              </p>
              <form onSubmit={handleSaveBirth} className="flex gap-2 items-end flex-wrap">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">년</label>
                  <input
                    value={birthForm.year}
                    onChange={e => setBirthForm(f => ({ ...f, year: e.target.value }))}
                    placeholder="1990" required
                    className="border border-gray-200 rounded px-2 py-1.5 text-sm w-16"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">월</label>
                  <input
                    value={birthForm.month}
                    onChange={e => setBirthForm(f => ({ ...f, month: e.target.value }))}
                    placeholder="5" required
                    className="border border-gray-200 rounded px-2 py-1.5 text-sm w-12"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">일</label>
                  <input
                    value={birthForm.day}
                    onChange={e => setBirthForm(f => ({ ...f, day: e.target.value }))}
                    placeholder="15" required
                    className="border border-gray-200 rounded px-2 py-1.5 text-sm w-12"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs px-4 py-1.5 rounded-lg"
                >
                  {loading ? '계산 중…' : '저장'}
                </button>
              </form>
            </div>
          ) : (
            /* ② 내 일간 + 오늘 관계 */
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400">내 일간(日干)</p>
                <p className="text-sm font-semibold text-gray-700">
                  {userSaju.dayMaster.stem}
                  <span className="text-gray-400 ml-1">({userSaju.dayMaster.stemKr})</span>
                  <span className="text-xs text-gray-400 ml-2">{userSaju.dayMaster.element}</span>
                </p>
                {relation && (
                  <p className={`text-xs font-medium ${relation.color}`}>
                    오늘은 {relation.text}
                  </p>
                )}
              </div>
              <button
                onClick={handleReset}
                className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors"
              >
                초기화
              </button>
            </div>
          )}

          {/* ③ 메모 입력 */}
          {userSaju && (
            <div>
              <p className="text-[10px] text-gray-400 mb-1.5">
                {today.date.year}.{today.date.month}.{today.date.day}&nbsp;
                <span className="font-medium text-gray-500">
                  {today.day.ganzhi}({today.day.stemKr}{today.day.branchKr})일
                </span>
                &nbsp;메모
              </p>
              <div className="flex gap-2">
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveNote()}
                  placeholder="오늘 하루 한 줄 기록…"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-300"
                />
                <button
                  onClick={handleSaveNote}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg shrink-0 transition-colors"
                >
                  {savedToday ? '수정' : '저장'}
                </button>
              </div>
            </div>
          )}

          {/* ④ 최근 기록 */}
          {entries.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 mb-2">최근 기록</p>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {entries.slice(0, 15).map(entry => (
                  <div key={entry.date} className="flex items-start gap-2 text-xs group">
                    <span className="text-gray-300 shrink-0 mt-0.5 font-mono tabular-nums">
                      {entry.date.slice(5).replace('-', '/')}
                    </span>
                    <span className="text-indigo-400 shrink-0 font-medium">{entry.ganzhi}</span>
                    <span className="text-gray-500 line-clamp-1">{entry.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

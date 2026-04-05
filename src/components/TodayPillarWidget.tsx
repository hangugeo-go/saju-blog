'use client'

import { useState, useEffect } from 'react'
import { getTodayGanzhi, type GanzhiInfo } from '@/lib/saju/todayGanzhi'
import { Link } from '@/i18n/navigation'

// 오행 색상
const ELEM_BG     = ['bg-green-100','bg-red-100','bg-amber-100','bg-gray-100','bg-blue-100']
const ELEM_TEXT   = ['text-green-800','text-red-700','text-amber-700','text-gray-600','text-blue-800']
const ELEM_BORDER = ['border-green-200','border-red-200','border-amber-200','border-gray-200','border-blue-200']
const ELEM_NAME   = ['목(木)','화(火)','토(土)','금(金)','수(水)']

// 오행 인덱스 (todayGanzhi.ts와 동일)
const STEM_ELEM_MAP   = [0,0,1,1,2,2,3,3,4,4]
const BRANCH_ELEM_MAP = [4,2,0,0,2,1,1,2,3,3,2,4]

// 오행 관계
const PRODUCES = [1,2,3,4,0]
const CONTROLS = [2,3,4,0,1]

function getRelation(myElem: number, todayElem: number) {
  if (myElem === todayElem) return { text: '⚖ 나와 같은 기운, 안정적인 하루예요', color: 'text-gray-500' }
  if (PRODUCES[myElem] === todayElem) return { text: '🌱 내 에너지를 나눠주는 날이에요', color: 'text-green-700' }
  if (PRODUCES[todayElem] === myElem) return { text: '✨ 오늘 기운이 나를 도와줘요', color: 'text-indigo-600' }
  if (CONTROLS[myElem] === todayElem) return { text: '💪 내가 주도적으로 이끄는 날이에요', color: 'text-amber-600' }
  return { text: '⚠ 조심하고 신중하게 행동하는 날이에요', color: 'text-red-600' }
}

// ── 타일 컴포넌트 ──────────────────────────────────────

function Tile({ info, pos }: { info: GanzhiInfo; pos: 'stem' | 'branch' }) {
  const elem = pos === 'stem' ? info.stemElem : info.branchElem
  const char = pos === 'stem' ? info.stem     : info.branch
  const kr   = pos === 'stem' ? info.stemKr   : info.branchKr
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl font-bold border
        ${ELEM_BG[elem]} ${ELEM_TEXT[elem]} ${ELEM_BORDER[elem]}`}>
        {char}
      </div>
      <span className="text-[10px] text-gray-400">{kr}</span>
    </div>
  )
}

function RawTile({ char, kr, elemIdx }: { char: string; kr: string; elemIdx: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl font-bold border
        ${ELEM_BG[elemIdx]} ${ELEM_TEXT[elemIdx]} ${ELEM_BORDER[elemIdx]}`}>
        {char}
      </div>
      <span className="text-[10px] text-gray-400">{kr}</span>
    </div>
  )
}

function PillarCol({ label, info, labelColor = 'text-indigo-400' }:
  { label: string; info: GanzhiInfo; labelColor?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`text-[10px] font-medium tracking-wide ${labelColor}`}>{label}</span>
      <div className="flex flex-col items-center gap-1">
        <Tile info={info} pos="stem"   />
        <Tile info={info} pos="branch" />
      </div>
    </div>
  )
}

function RawPillarCol({ label, p, labelColor = 'text-rose-400' }:
  { label: string; p: StoredPillar; labelColor?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`text-[10px] font-medium tracking-wide ${labelColor}`}>{label}</span>
      <div className="flex flex-col items-center gap-1">
        <RawTile char={p.stem}   kr={p.stemKr}   elemIdx={STEM_ELEM_MAP[p.stemIdx]}   />
        <RawTile char={p.branch} kr={p.branchKr} elemIdx={BRANCH_ELEM_MAP[p.branchIdx]} />
      </div>
    </div>
  )
}

// ── 타입 ──────────────────────────────────────────────

interface StoredPillar {
  stem: string; branch: string;
  stemKr: string; branchKr: string;
  stemIdx: number; branchIdx: number;
}

interface UserSaju {
  birth: { year: number; month: number; day: number }
  dayMaster: { stemKr: string; stem: string; elementIdx: number; element: string }
  pillars?: {
    year: StoredPillar; month: StoredPillar; day: StoredPillar;
    hour: StoredPillar | null;
  }
}

// ── 메인 위젯 ─────────────────────────────────────────

export default function TodayPillarWidget() {
  const [userSaju, setUserSaju] = useState<UserSaju | null>(null)
  const { year, month, day, date } = getTodayGanzhi()
  const { year: y, month: m, day: d } = date

  useEffect(() => {
    const stored = localStorage.getItem('journal_saju')
    if (stored) setUserSaju(JSON.parse(stored))
  }, [])

  const relation = userSaju
    ? getRelation(userSaju.dayMaster.elementIdx, day.stemElem)
    : null

  const up = userSaju?.pillars

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">

        {/* ── 오늘의 일진 ── */}
        <div className="flex-1 min-w-0">
          <p className="text-indigo-500 text-xs mb-3 font-semibold tracking-wide">
            {y}년 {m}월 {d}일 오늘의 일진
          </p>
          <div className="flex items-start gap-3 flex-wrap">
            <PillarCol label="연주" info={year}  />
            <div className="w-px bg-gray-100 self-stretch mx-0.5" />
            <PillarCol label="월주" info={month} />
            <div className="w-px bg-gray-100 self-stretch mx-0.5" />
            <PillarCol label="일주" info={day}   />
          </div>
        </div>

        {/* ── 구분선 ── */}
        <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
        <div className="block sm:hidden h-px bg-gray-100 w-full" />

        {/* ── 내 사주 ── */}
        <div className="flex-1 min-w-0">
          {up ? (
            <>
              <p className="text-rose-400 text-xs mb-3 font-semibold tracking-wide">
                내 사주
                {relation && (
                  <span className={`ml-2 font-normal ${relation.color}`}>
                    — {relation.text}
                  </span>
                )}
              </p>
              <div className="flex items-start gap-3 flex-wrap">
                <RawPillarCol label="연주" p={up.year}  />
                <div className="w-px bg-gray-100 self-stretch mx-0.5" />
                <RawPillarCol label="월주" p={up.month} />
                <div className="w-px bg-gray-100 self-stretch mx-0.5" />
                <RawPillarCol label="일주" p={up.day}   />
                {up.hour && (
                  <>
                    <div className="w-px bg-gray-100 self-stretch mx-0.5" />
                    <RawPillarCol label="시주" p={up.hour} />
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center h-full gap-1.5">
              <p className="text-xs text-gray-400">내 사주를 설정하면</p>
              <p className="text-xs text-gray-400">오늘 일진과의 관계를 볼 수 있어요</p>
              <p className="text-[10px] text-gray-300 mt-1">↓ 일진 기록하기에서 설정</p>
            </div>
          )}
        </div>

        {/* ── 오행 범례 + CTA ── */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
          <div className="flex sm:flex-col flex-row gap-1 flex-wrap">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm border ${ELEM_BG[i]} ${ELEM_BORDER[i]}`} />
                <span className="text-[9px] text-gray-400">{ELEM_NAME[i]}</span>
              </div>
            ))}
          </div>
          <Link
            href="/saju"
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            사주 분석 →
          </Link>
        </div>

      </div>
    </div>
  )
}

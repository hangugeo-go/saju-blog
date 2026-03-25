import { getTodayGanzhi, type GanzhiInfo } from '@/lib/saju/todayGanzhi'
import { Link } from '@/i18n/navigation'

// 오행 색상 — 사이트 테마에 맞는 소프트 톤
const ELEM_BG   = ['bg-green-100','bg-red-100','bg-amber-100','bg-gray-100','bg-blue-100']
const ELEM_TEXT = ['text-green-800','text-red-700','text-amber-700','text-gray-600','text-blue-800']
const ELEM_BORDER = ['border-green-200','border-red-200','border-amber-200','border-gray-200','border-blue-200']
const ELEM_NAME = ['목(木)','화(火)','토(土)','금(金)','수(水)']

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

function PillarCol({ label, info }: { label: string; info: GanzhiInfo }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-medium text-indigo-400 tracking-wide">{label}</span>
      <div className="flex flex-col items-center gap-1">
        <Tile info={info} pos="stem"   />
        <Tile info={info} pos="branch" />
      </div>
    </div>
  )
}

export default function TodayPillarWidget() {
  const { year, month, day, date } = getTodayGanzhi()
  const { year: y, month: m, day: d } = date

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
      {/* 날짜 + 연주·월주·일주 */}
      <div>
        <p className="text-indigo-500 text-xs mb-3 font-semibold tracking-wide">
          {y}년 {m}월 {d}일 오늘의 일진
        </p>
        <div className="flex items-start gap-3">
          <PillarCol label="연주" info={year}  />
          <div className="w-px bg-gray-100 self-stretch mx-0.5" />
          <PillarCol label="월주" info={month} />
          <div className="w-px bg-gray-100 self-stretch mx-0.5" />
          <PillarCol label="일주" info={day}   />
        </div>
      </div>

      {/* 오행 범례 + CTA */}
      <div className="flex flex-col items-end gap-3 shrink-0">
        <div className="flex flex-col gap-1">
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
  )
}

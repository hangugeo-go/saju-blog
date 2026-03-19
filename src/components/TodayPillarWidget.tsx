import { getTodayGanzhi, type GanzhiInfo } from '@/lib/saju/todayGanzhi'
import { Link } from '@/i18n/navigation'

// 오행 색상 시스템 (k-fortune 참조)
const ELEM_BG   = ['bg-green-600','bg-red-600','bg-yellow-500','bg-slate-300','bg-slate-800']
const ELEM_TEXT = ['text-white',  'text-white', 'text-white',  'text-slate-800','text-white']
const ELEM_NAME = ['목(木)','화(火)','토(土)','금(金)','수(水)']

function Tile({ info, pos }: { info: GanzhiInfo; pos: 'stem' | 'branch' }) {
  const elem = pos === 'stem' ? info.stemElem : info.branchElem
  const char = pos === 'stem' ? info.stem     : info.branch
  const kr   = pos === 'stem' ? info.stemKr   : info.branchKr
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl font-bold
        ${ELEM_BG[elem]} ${ELEM_TEXT[elem]} shadow-sm`}>
        {char}
      </div>
      <span className="text-[10px] text-slate-400">{kr}</span>
    </div>
  )
}

export default function TodayPillarWidget() {
  const { year, day, date } = getTodayGanzhi()
  const { year: y, month: m, day: d } = date

  return (
    <div className="bg-slate-900 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-md">
      {/* 날짜 + 일주 */}
      <div>
        <p className="text-slate-400 text-xs mb-3 font-medium tracking-wide">
          | {y}년 {m}월 {d}일 오늘의 일진
        </p>
        <div className="flex gap-3">
          {/* 연주 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500">연주</span>
            <div className="flex flex-col items-center gap-1">
              <Tile info={year} pos="stem"   />
              <Tile info={year} pos="branch" />
            </div>
          </div>
          {/* 구분선 */}
          <div className="w-px bg-slate-700 self-stretch mx-1" />
          {/* 일주 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500">일주</span>
            <div className="flex flex-col items-center gap-1">
              <Tile info={day} pos="stem"   />
              <Tile info={day} pos="branch" />
            </div>
          </div>
        </div>
      </div>

      {/* 오행 범례 + CTA */}
      <div className="flex flex-col items-end gap-3 shrink-0">
        <div className="flex flex-col gap-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${ELEM_BG[i]}`} />
              <span className="text-[9px] text-slate-500">{ELEM_NAME[i]}</span>
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

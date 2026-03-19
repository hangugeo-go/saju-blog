/**
 * 오늘의 일진(日辰) 계산 — 외부 의존 없는 순수 TS 모듈
 * 연주(年柱)·일주(日柱) 천간지지 및 오행 반환
 */

const STEMS    = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const STEMS_KR    = ['갑','을','병','정','무','기','경','신','임','계']
const BRANCHES_KR = ['자','축','인','묘','진','사','오','미','신','유','술','해']

// 오행 인덱스: 0=木 1=火 2=土 3=金 4=水
const STEM_ELEM:   number[] = [0,0,1,1,2,2,3,3,4,4]
const BRANCH_ELEM: number[] = [4,2,0,0,2,1,1,2,3,3,2,4]

// 참조: 2020-01-22 = 甲子日 (60갑자 index 0)
const DAY_REF_DAYS = daysSinceEpoch(2020, 1, 22)

/** 율리우스적일로 변환 (그레고리력) */
function toJD(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12)
  const yy = y + 4800 - a
  const mm = m + 12 * a - 3
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
    Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045
}

function daysSinceEpoch(y: number, m: number, d: number): number {
  return Math.floor(toJD(y, m, d) + 0.5)
}

export interface GanzhiInfo {
  stem: string;      // 천간 한자 (e.g. 辛)
  branch: string;    // 지지 한자 (e.g. 卯)
  stemKr: string;    // 천간 한글 (e.g. 신)
  branchKr: string;  // 지지 한글 (e.g. 묘)
  stemElem: number;  // 천간 오행 0~4
  branchElem: number;// 지지 오행 0~4
  ganzhi: string;    // 합친 2자 (e.g. 辛卯)
}

export interface TodayGanzhi {
  year: GanzhiInfo
  day:  GanzhiInfo
  date: { year: number; month: number; day: number }
}

function makeInfo(idx60: number): GanzhiInfo {
  const si = idx60 % 10
  const bi = idx60 % 12
  return {
    stem:      STEMS[si],
    branch:    BRANCHES[bi],
    stemKr:    STEMS_KR[si],
    branchKr:  BRANCHES_KR[bi],
    stemElem:  STEM_ELEM[si],
    branchElem:BRANCH_ELEM[bi],
    ganzhi:    STEMS[si] + BRANCHES[bi],
  }
}

export function getTodayGanzhi(): TodayGanzhi {
  const now   = new Date()
  const y     = now.getFullYear()
  const m     = now.getMonth() + 1
  const d     = now.getDate()

  // 연주: 甲子년=1984 기준 (입춘 미보정 간이계산)
  const yearIdx = ((y - 1984) % 60 + 60) % 60

  // 일주: 참조일 기준 60갑자 순환
  const todayDays = daysSinceEpoch(y, m, d)
  const dayIdx    = ((todayDays - DAY_REF_DAYS) % 60 + 60) % 60

  return {
    year: makeInfo(yearIdx),
    day:  makeInfo(dayIdx),
    date: { year: y, month: m, day: d },
  }
}

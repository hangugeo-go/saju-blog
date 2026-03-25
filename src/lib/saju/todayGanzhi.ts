/**
 * 오늘의 일진(日辰) 계산 — 외부 의존 없는 순수 TS 모듈
 * 연주(年柱)·월주(月柱)·일주(日柱) 천간지지 및 오행 반환
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

/**
 * 절기 간략 날짜표 (양력 기준, 월별 입절일 근사치)
 * index 0 = 1월 소한(小寒), index 1 = 2월 입춘(立春), ...
 * 매년 1~2일 오차가 있을 수 있으나 일진 위젯 수준에서는 충분
 */
const SOLAR_TERM_DAYS = [6, 4, 6, 5, 6, 6, 7, 7, 8, 8, 7, 7]

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
  year:  GanzhiInfo
  month: GanzhiInfo
  day:   GanzhiInfo
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

/**
 * 월주 계산
 * - 월지(月支): 寅月(인월)이 1월(입춘 이후), 이후 순서대로
 *   절기 기준으로 달이 바뀌므로 입절일 이전이면 이전 달로 처리
 * - 월간(月干): 년간에 따라 寅月 기준 천간이 정해짐
 *   甲/己년→丙寅, 乙/庚년→戊寅, 丙/辛년→庚寅, 丁/壬년→壬寅, 戊/癸년→甲寅
 */
function getMonthIdx(y: number, m: number, d: number, yearStemIdx: number): number {
  // 절기 기준으로 월 조정 (입절일 이전이면 전월로)
  const termDay = SOLAR_TERM_DAYS[m - 1]
  const solarMonth = d < termDay ? m - 1 : m

  // 월지: 양1월→丑(1), 양2월→寅(2), ..., 양11월→亥(11), 양12월→子(0)
  // 즉, bi = solarMonth % 12  (12→0, 1→1, 2→2, ...)
  const bi = ((solarMonth % 12) + 12) % 12

  // 월간 기준: 년간에 따라 寅月(양2월) 천간 결정
  // 甲(0)/己(5)→丙(2), 乙(1)/庚(6)→戊(4), 丙(2)/辛(7)→庚(6), 丁(3)/壬(8)→壬(8), 戊(4)/癸(9)→甲(0)
  const stemBases = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]
  const yinMonthStem = stemBases[yearStemIdx]  // 寅月 천간 인덱스

  // 寅月(bi=2)를 기준으로 현재 월까지의 오프셋
  const monthOffset = (bi - 2 + 12) % 12
  const si = (yinMonthStem + monthOffset) % 10

  // 60갑자 인덱스 복원 (stem+branch로 유일 결정)
  // idx60 = stem*12 + branch 아님 — lcm(10,12)=60이므로 역산 필요
  // 간단히: idx = si*6 + (bi >= si%2*6 ? ... ) — 대신 순열 탐색
  for (let i = 0; i < 60; i++) {
    if (i % 10 === si && i % 12 === bi) return i
  }
  return 0
}

export function getTodayGanzhi(): TodayGanzhi {
  const now   = new Date()
  const y     = now.getFullYear()
  const m     = now.getMonth() + 1
  const d     = now.getDate()

  // 연주: 甲子년=1984 기준 (입춘 미보정 간이계산)
  const yearIdx = ((y - 1984) % 60 + 60) % 60
  const yearStemIdx = yearIdx % 10

  // 월주
  const monthIdx = getMonthIdx(y, m, d, yearStemIdx)

  // 일주: 참조일 기준 60갑자 순환
  const todayDays = daysSinceEpoch(y, m, d)
  const dayIdx    = ((todayDays - DAY_REF_DAYS) % 60 + 60) % 60

  return {
    year:  makeInfo(yearIdx),
    month: makeInfo(monthIdx),
    day:   makeInfo(dayIdx),
    date: { year: y, month: m, day: d },
  }
}

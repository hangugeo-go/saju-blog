import { NextRequest, NextResponse } from 'next/server'

// App Router Route Handler — body size is handled by Next.js defaults (4MB)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { analyzeCompatibility } = require('@/lib/saju/compatibilityEngine')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { lunarToSolar } = require('@/lib/saju/astronomy')

// ── 음력 → 양력 변환 ─────────────────────────────────────────────────
function applyLunarConversion(person: Record<string, unknown>) {
  if (person.calendarType !== 'lunar') return
  const y = parseInt(person.year as string)
  const m = parseInt(person.month as string)
  const d = parseInt(person.day as string)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return
  const isLeap = !!person.isLeapMonth
  const solar = lunarToSolar(y, m, d, isLeap)
  person.year  = solar.year
  person.month = solar.month
  person.day   = solar.day
  person.calendarType = 'solar'
  const leapStr = isLeap ? ' 윤달' : ''
  person._lunarOriginal = `${y}년 ${m}월${leapStr} ${d}일 (음력)`
}

// ── 입력 검증 ─────────────────────────────────────────────────────────
function validateInput(person: Record<string, unknown> | null | undefined, label: string): string | null {
  if (!person) return `인물 ${label} 데이터가 없습니다.`
  applyLunarConversion(person)

  const { year, month, day } = person
  if (!year || !month || !day) return `인물 ${label}의 생년월일이 필요합니다.`

  const y = parseInt(year as string)
  const m = parseInt(month as string)
  const d = parseInt(day as string)

  if (isNaN(y) || y < 1900 || y > 2100) return `인물 ${label}의 연도가 유효하지 않습니다 (1900~2100).`
  if (isNaN(m) || m < 1 || m > 12)      return `인물 ${label}의 월이 유효하지 않습니다 (1~12).`
  if (isNaN(d) || d < 1 || d > 31)      return `인물 ${label}의 일이 유효하지 않습니다 (1~31).`

  const daysInMonth = new Date(y, m, 0).getDate()
  if (d > daysInMonth) return `인물 ${label}의 날짜가 유효하지 않습니다 (${y}년 ${m}월은 최대 ${daysInMonth}일).`

  const h   = person.hour   !== undefined ? parseFloat(person.hour as string)   : null
  const min = person.minute !== undefined ? parseFloat(person.minute as string) : null
  if (h !== null && !person.hourUnknown) {
    if (isNaN(h) || h < 0 || h > 23) return `인물 ${label}의 시각이 유효하지 않습니다 (0~23시).`
  }
  if (min !== null && !person.hourUnknown) {
    if (isNaN(min) || min < 0 || min > 59) return `인물 ${label}의 분이 유효하지 않습니다 (0~59분).`
  }

  person.year  = y
  person.month = m
  person.day   = d
  if (person.hour   !== undefined) person.hour   = h
  if (person.minute !== undefined) person.minute = min
  if (person.longitude !== undefined) person.longitude = parseFloat(person.longitude as string)
  if (person.latitude  !== undefined) person.latitude  = parseFloat(person.latitude as string)

  return null
}

// ── POST /api/compatibility ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { personA, personB, relationType = 'romantic' } = body

    const error = validateInput(personA, 'A') ?? validateInput(personB, 'B')
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 })
    }

    const validTypes = ['romantic', 'work', 'parent_child', 'friend']
    if (!validTypes.includes(relationType)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 관계 유형입니다.' }, { status: 400 })
    }

    const result = await analyzeCompatibility(personA, personB, relationType)
    return NextResponse.json({ success: true, data: result })

  } catch (err) {
    console.error('[Compatibility API Error]', err)
    return NextResponse.json(
      { success: false, error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

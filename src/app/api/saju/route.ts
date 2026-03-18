import { NextRequest, NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { calcSaju } = require('@/lib/saju/sajuEngine')

export async function POST(req: NextRequest) {
  try {
    const { person } = await req.json()
    if (!person) {
      return NextResponse.json({ success: false, error: '사람 데이터가 없습니다.' }, { status: 400 })
    }
    const result = calcSaju(person)
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('[Saju API Error]', err)
    return NextResponse.json({ success: false, error: '사주 계산 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

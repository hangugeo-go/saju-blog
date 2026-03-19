import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { calcSaju } = require('@/lib/saju/sajuEngine')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { lunarToSolar } = require('@/lib/saju/astronomy')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getHourBranchIdx } = require('@/lib/saju/constants/ganzhi')

// ── 일간 프로파일 ─────────────────────────────────────────────────────
const DAY_MASTER_PROFILE: Record<string, {
  element: string; nickname: string; personality: string;
  strengths: string; weaknesses: string; career: string; relationship: string
}> = {
  갑: { element: '목(木)', nickname: '갑목(甲木) — 대나무', personality: '직선적 추진력과 강한 독립심. 리더십이 본능적으로 발현되며 새로운 길을 개척하려는 성향.', strengths: '결단력, 개척정신, 정직함, 강한 의지', weaknesses: '고집, 타협 어려움, 완고함, 독선 경향', career: '창업자, 리더십 직군, 연구개발, 스포츠', relationship: '관계에서 주도권을 잡으려 하며 헌신적이나, 지배적이 되지 않도록 의식적 양보 필요.' },
  을: { element: '목(木)', nickname: '을목(乙木) — 넝쿨식물', personality: '유연한 적응력과 섬세한 관계 감각. 환경에 맞게 전략적으로 변화하며 생존력이 강함.', strengths: '소통 능력, 적응력, 섬세함, 포용력', weaknesses: '우유부단, 방향 전환 잦음, 의존성', career: '기획자, 상담사, 예술가, 교육자', relationship: '깊은 배려심을 가지나 자기 의사를 명확히 표현하는 훈련 필요.' },
  병: { element: '화(火)', nickname: '병화(丙火) — 태양', personality: '외향적 활동력과 강한 명예욕. 타인에게 에너지와 활력을 주는 존재감이 큼.', strengths: '사교성, 추진력, 낙관주의, 열정', weaknesses: '충동성, 지속성 약함, 과시 경향', career: '영업, 방송·미디어, 정치, 연예', relationship: '주목받고 인정받는 것이 중요. 파트너의 칭찬과 지지가 관계 에너지를 충전.' },
  정: { element: '화(火)', nickname: '정화(丁火) — 촛불', personality: '섬세하고 따뜻한 내면. 강한 감수성과 예술적 감각으로 깊은 인간관계 형성.', strengths: '공감 능력, 헌신성, 예술적 감각, 직관력', weaknesses: '감정 기복, 지나친 걱정, 번아웃 위험', career: '예술가, 상담사, 교육자, 의료인', relationship: '깊은 정서적 유대 추구. 감정 소통이 핵심이며 감정 소진을 주의.' },
  무: { element: '토(土)', nickname: '무토(戊土) — 큰 산', personality: '묵직하고 안정적인 성격. 신뢰와 포용력으로 주변의 중심이 됨.', strengths: '인내력, 신뢰성, 포용력, 안정감', weaknesses: '변화 적응 느림, 보수성, 고집', career: '관리직, 부동산, 금융, 공무원', relationship: '안정과 신뢰를 제공하는 파트너. 변화를 두려워하지 않는 유연함 필요.' },
  기: { element: '토(土)', nickname: '기토(己土) — 논밭', personality: '실용적이고 분석적인 현실감각. 꼼꼼하게 계획하고 성실히 실행하는 성향.', strengths: '계획성, 현실감각, 성실함, 꼼꼼함', weaknesses: '우유부단, 과도한 걱정, 소극성', career: '행정, 분석, 회계, 의학, 연구', relationship: '실용적으로 사랑을 표현. 감정 표현을 더 직접적으로 하는 연습 효과적.' },
  경: { element: '금(金)', nickname: '경금(庚金) — 도끼', personality: '원칙적이고 결단력이 강한 성격. 독립적이며 명확한 기준으로 행동.', strengths: '의지력, 정의감, 명확한 기준, 책임감', weaknesses: '비타협적, 냉정함, 융통성 부족', career: '법조인, 군·경찰, 금융, 경영', relationship: '기준 명확. 파트너의 감정적 호소보다 논리적 설명이 효과적.' },
  신: { element: '금(金)', nickname: '신금(辛金) — 보석', personality: '세련된 미적 감각과 완벽주의. 예리한 판단력으로 본질을 꿰뚫음.', strengths: '예리함, 미적 감각, 정확성, 섬세함', weaknesses: '강한 자존심, 양보 어려움, 예민함', career: '디자인, 패션, 법조, 의학, 예술', relationship: '높은 기준을 가지며 파트너에게도 동등한 수준 기대. 현실적 기대치 조정 필요.' },
  임: { element: '수(水)', nickname: '임수(壬水) — 큰 강', personality: '깊은 사고력과 전략적 유연성. 환경 변화에 적응하며 큰 그림을 그리는 능력 탁월.', strengths: '통찰력, 적응성, 전략적 사고, 포용력', weaknesses: '감정 표현 약함, 모호한 경계선', career: '전략기획, IT, 연구, 투자, 철학', relationship: '감정보다 이성 중심. 파트너에게 직접적 감정 표현 연습 필요.' },
  계: { element: '수(水)', nickname: '계수(癸水) — 이슬·빗물', personality: '통찰력이 탁월하며 신중하고 관찰적. 깊은 지혜와 섬세한 감각.', strengths: '직관력, 지혜, 분석 능력, 신중함', weaknesses: '지나친 걱정, 불안 경향, 결정 지연', career: '연구, 철학, 상담, 의학, 글쓰기', relationship: '깊은 유대를 원함. 불안감을 파트너와 솔직히 나누면 신뢰가 커짐.' },
}

// ── 오행 처세 ────────────────────────────────────────────────────────
const ELEMENT_ADVICE: Record<number, { excess: string; lack: string }> = {
  0: { excess: '목(木) 과다: 추진력은 강하나 고집과 독선에 주의. 타인 의견 경청 훈련 필요.', lack: '목(木) 부족: 결단력과 추진력이 약함. 목표 설정 후 바로 실행하는 원칙 권장.' },
  1: { excess: '화(火) 과다: 열정적이나 충동적 결정 주의. 중요 결정 전 하루 숙고 원칙.', lack: '화(火) 부족: 동기 부여 낮거나 감정 표현 절제됨. 활동적 취미로 에너지 활성화.' },
  2: { excess: '토(土) 과다: 보수적이고 변화 거부 경향. 새로운 경험을 의도적으로 시도할 것.', lack: '토(土) 부족: 현실 감각과 안정성 약함. 재정 계획과 생활 루틴 확립이 도움.' },
  3: { excess: '금(金) 과다: 원칙적이고 비판적 발언이 잦을 수 있음. 부드러운 표현 연습 필요.', lack: '금(金) 부족: 기준과 원칙이 모호함. 명확한 자기 기준 확립이 중요.' },
  4: { excess: '수(水) 과다: 사고 깊지만 우유부단하거나 걱정 과다. 행동 우선 원칙 도입 권장.', lack: '수(水) 부족: 직관력과 유연성 약함. 다양한 관점 수용과 독서로 사고 확장.' },
}

// ── 입력 검증 ─────────────────────────────────────────────────────────
function validateAndParse(body: Record<string, unknown>): { data: Record<string, unknown>; error: string | null } {
  const y = parseInt(body.year as string)
  const m = parseInt(body.month as string)
  const d = parseInt(body.day as string)

  if (isNaN(y) || y < 1900 || y > 2100) return { data: body, error: '연도가 유효하지 않습니다 (1900~2100).' }
  if (isNaN(m) || m < 1 || m > 12)      return { data: body, error: '월이 유효하지 않습니다 (1~12).' }
  if (isNaN(d) || d < 1 || d > 31)      return { data: body, error: '일이 유효하지 않습니다 (1~31).' }

  const parsed: Record<string, unknown> = { ...body, year: y, month: m, day: d }

  if (body.calendarType === 'lunar') {
    const isLeap = !!body.isLeapMonth
    const solar = lunarToSolar(y, m, d, isLeap)
    parsed.year = solar.year; parsed.month = solar.month; parsed.day = solar.day
    parsed.calendarType = 'solar'
    parsed._lunarOriginal = `${y}년 ${m}월${isLeap ? ' 윤달' : ''} ${d}일 (음력)`
  }

  if (!body.hourUnknown && body.hour !== undefined) {
    const h   = parseFloat(body.hour as string)
    const min = parseFloat((body.minute as string) || '0')
    if (isNaN(h) || h < 0 || h > 23) return { data: parsed, error: '시각이 유효하지 않습니다 (0~23시).' }
    parsed.hour   = h
    parsed.minute = min
  }

  if (body.longitude) parsed.longitude = parseFloat(body.longitude as string)

  return { data: parsed, error: null }
}

// ── 해석 생성 ─────────────────────────────────────────────────────────
function buildInterpretation(saju: Record<string, unknown>) {
  const dayMaster = saju.dayMaster as Record<string, unknown>
  const elementCount = saju.elementCount as number[]
  const johu = saju.johu as Record<string, unknown>

  const stemKr = dayMaster?.stemKr as string
  const profile = DAY_MASTER_PROFILE[stemKr] || null

  const elemAdvice: string[] = []
  if (elementCount) {
    elementCount.forEach((cnt, i) => {
      if (cnt >= 4) elemAdvice.push(ELEMENT_ADVICE[i].excess)
      else if (cnt === 0) elemAdvice.push(ELEMENT_ADVICE[i].lack)
    })
  }

  return {
    dayMasterProfile: profile,
    elementAdvice: elemAdvice.slice(0, 2),
    johuSummary: {
      needs: (johu?.needs as string[]) || [],
      comment: johu?.comment as string,
    },
    kongwang: saju.kongwang,
    reliability: saju.reliability,
  }
}

// ── POST /api/saju ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error } = validateAndParse(body)
    if (error) return NextResponse.json({ success: false, error }, { status: 400 })

    const saju = calcSaju(data)

    let hourBranchIdx = -1
    if (!data.hourUnknown && data.hour !== undefined) {
      hourBranchIdx = getHourBranchIdx(data.hour as number, (data.minute as number) || 0)
    }

    const interpretation = buildInterpretation(saju)

    return NextResponse.json({
      success: true,
      data: { ...saju, interpretation, hourBranchIdx, inputName: body.name || null, _lunarOriginal: data._lunarOriginal || null }
    })
  } catch (err) {
    console.error('[Saju API Error]', err)
    return NextResponse.json({ success: false, error: '사주 계산 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

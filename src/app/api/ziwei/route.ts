import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { calcSaju } = require('@/lib/saju/sajuEngine')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { calcZiWei, MAIN_STARS } = require('@/lib/saju/ziWeiEngine')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { lunarToSolar, gregorianToJD } = require('@/lib/saju/astronomy')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getHourBranchIdx } = require('@/lib/saju/constants/ganzhi')

// ── 명궁 지지별 성격 프로파일 ────────────────────────────────────────
const LIFE_PALACE_PROFILE: Record<string, { personality: string; strengths: string; challenges: string }> = {
  자: { personality: '총명하고 분석적. 깊은 사고력과 관찰력이 뛰어나며 독립적인 성향.', strengths: '지적 호기심, 통찰력, 적응력', challenges: '과도한 분석과 걱정, 감정 표현 어려움' },
  축: { personality: '인내심이 강하고 실용적. 안정을 추구하며 꼼꼼하게 실행하는 성향.', strengths: '인내력, 성실함, 현실감각', challenges: '변화 적응 느림, 보수성, 고집' },
  인: { personality: '열정적이고 행동 지향적. 리더십이 강하며 새로운 시도를 두려워하지 않음.', strengths: '추진력, 용기, 리더십', challenges: '성급함, 충동적 결정, 인내심 부족' },
  묘: { personality: '창의적이고 섬세함. 예술적 감각과 뛰어난 표현력으로 사람들을 매료시킴.', strengths: '창의성, 표현력, 섬세함', challenges: '우유부단, 변덕, 감정 기복' },
  진: { personality: '변화무쌍하고 재능이 다양함. 새로운 아이디어를 추진하는 에너지가 넘침.', strengths: '다재다능, 추진력, 창의성', challenges: '산만함, 끈기 부족, 방향성 모호' },
  사: { personality: '예리하고 통찰력이 탁월. 전략적 사고로 복잡한 상황을 해결하는 능력.', strengths: '전략적 사고, 통찰력, 집중력', challenges: '의심 많음, 비밀주의, 과도한 분석' },
  오: { personality: '밝고 활동적이며 사교적. 강한 카리스마로 주변을 이끄는 존재감.', strengths: '카리스마, 사교성, 열정', challenges: '충동성, 자기중심성, 감정 기복' },
  미: { personality: '온화하고 예술적 감각이 풍부. 배려심이 깊고 인간관계를 소중히 여김.', strengths: '배려심, 예술성, 협력 능력', challenges: '우유부단, 자기희생 과도, 경계 설정 어려움' },
  신: { personality: '영리하고 변화 적응력이 탁월. 다양한 분야에서 능력을 발휘하는 다재다능형.', strengths: '적응력, 영리함, 다재다능', challenges: '불안정성, 집중력 부족, 신뢰성 문제' },
  유: { personality: '세련되고 완벽주의적. 높은 미적 감각과 정밀함으로 탁월한 성과를 냄.', strengths: '완벽주의, 미적 감각, 정밀함', challenges: '강한 자존심, 비판 수용 어려움, 완벽에 집착' },
  술: { personality: '정의롭고 원칙적. 솔직하며 의리를 중시하는 강직한 성격.', strengths: '정의감, 솔직함, 의리', challenges: '고집, 융통성 부족, 갈등 유발' },
  해: { personality: '자유롭고 이상주의적. 깊은 감성과 풍부한 상상력을 가진 몽상가형.', strengths: '감성, 상상력, 이타심', challenges: '현실 감각 부족, 경계 모호, 방황 경향' },
}

// ── 주성별 해석 ───────────────────────────────────────────────────────
const STAR_INTERPRETATION: Record<string, { lifeMeaning: string; careerHint: string; relationshipHint: string }> = {
  ZIWEI:    { lifeMeaning: '자미성 명궁: 타고난 리더십과 권위. 지도자로서의 자질과 자존감이 높음.', careerHint: '경영, 정치, 리더십 직군', relationshipHint: '관계에서 주도권을 가지려 함. 파트너의 독립성도 존중할 것.' },
  TIANJI:   { lifeMeaning: '천기성 명궁: 예리한 두뇌와 변화 적응력. 지혜로 문제를 해결하는 전략가 유형.', careerHint: '기획, IT, 전략컨설팅, 연구', relationshipHint: '변화를 즐기는 관계. 정서적 안정을 줄 수 있는 파트너와 궁합 좋음.' },
  TAIYANG:  { lifeMeaning: '태양성 명궁: 사교적이고 명예 지향. 사람들 사이에서 빛을 발하는 외향적 에너지.', careerHint: '영업, 교육, 공공부문, 연예', relationshipHint: '사교적 관계 선호. 자신을 인정해 주는 파트너와 좋은 궁합.' },
  WUQU:     { lifeMeaning: '무곡성 명궁: 강한 재물운과 독립심. 결단력과 행동력으로 목표를 이루는 유형.', careerHint: '금융, 군인, 경영, 무역', relationshipHint: '독립적 성향 강. 자율적 공간을 허용하는 파트너와 안정적.' },
  'TIАНТONG': { lifeMeaning: '천동성 명궁: 복덕이 풍부하고 낙관적. 여유로운 마음으로 삶을 즐기는 성향.', careerHint: '복지, 예술, 서비스업, 교육', relationshipHint: '평화로운 관계 추구. 갈등 회피 경향이 있어 직접 소통 훈련 필요.' },
  LIANZHEN: { lifeMeaning: '염정성 명궁: 야망과 욕구가 강함. 열정적으로 목표를 추구하는 에너지.', careerHint: '법조, 군인, 예술, 정치', relationshipHint: '강한 열정을 가진 파트너. 에너지를 건설적 방향으로 사용하면 강한 유대 형성.' },
  TIANFU:   { lifeMeaning: '천부성 명궁: 안정적이고 재물 축적 능력 탁월. 재물창고 별로 경제적 능력이 강함.', careerHint: '금융, 부동산, 관리직', relationshipHint: '안정과 보호를 제공하는 파트너. 감정 표현을 더 풍부하게 할 것.' },
  TAIYIN:   { lifeMeaning: '태음성 명궁: 풍부한 감성과 직관력. 내면의 세계가 깊고 예술적 감각이 탁월.', careerHint: '예술, 문학, 상담, 의학', relationshipHint: '깊은 감성적 유대를 추구. 섬세한 감정 공유가 관계의 핵심.' },
  TANLANG:  { lifeMeaning: '탐랑성 명궁: 다양한 욕구와 매력. 재능이 다방면에 걸쳐 있고 매력적인 개성.', careerHint: '예술, 연예, 영업, 철학', relationshipHint: '다양한 관계 경험을 통해 성장. 한 사람에게 집중하는 훈련 필요.' },
  JUMEN:    { lifeMeaning: '거문성 명궁: 언변과 분석력이 탁월. 토론과 연구를 통해 진실을 추구하는 성향.', careerHint: '법조, 언론, 교육, 연구', relationshipHint: '솔직한 소통을 중시. 논쟁적 성향이 갈등을 유발할 수 있으니 조율 필요.' },
  TIANXIANG: { lifeMeaning: '천상성 명궁: 협력적이고 성실함. 팀의 조화를 유지하는 중재자 역할.', careerHint: '행정, 법조, 인사관리, 상담', relationshipHint: '협력적 관계를 만드는 능력. 자신의 의견도 명확히 표현할 것.' },
  TIANLIANG: { lifeMeaning: '천량성 명궁: 수호와 조언 능력. 타인을 보호하고 지도하는 역할에서 빛남.', careerHint: '의학, 교육, 종교, 상담', relationshipHint: '보호자적 성향 강. 지나친 간섭이 되지 않도록 파트너 자율성 존중.' },
  QISHA:    { lifeMeaning: '칠살성 명궁: 독립적이고 투쟁력 강. 변화와 도전을 두려워하지 않는 용기.', careerHint: '군인, 경찰, 스포츠, 창업', relationshipHint: '독립적 성향 강. 함께하되 각자의 공간이 있는 관계에서 최적.' },
  POJUN:    { lifeMeaning: '파군성 명궁: 개혁과 혁신의 에너지. 기존 틀을 깨고 새로운 길을 여는 선구자.', careerHint: '창업, 연예, 예술, 사회운동', relationshipHint: '변화와 자극을 주는 관계 선호. 안정적 파트너와 균형을 이루면 좋음.' },
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

// ── POST /api/ziwei ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error } = validateAndParse(body)
    if (error) return NextResponse.json({ success: false, error }, { status: 400 })

    // 사주 계산으로 JD 및 시지 얻기
    const saju = calcSaju(data)
    const stdHour = (data.hour as number || 12) + ((data.minute as number) || 0) / 60
    const jd = gregorianToJD(data.year as number, data.month as number, data.day as number, stdHour - 9)

    let hourBranchIdx = -1
    if (!data.hourUnknown && data.hour !== undefined) {
      hourBranchIdx = getHourBranchIdx(data.hour as number, (data.minute as number) || 0)
    }

    const ziwei = calcZiWei(data, jd, hourBranchIdx)

    // 명궁 지지 해석
    const lifePalanceBranchKr = ziwei.lifePalaceBranch as string
    const lifePalaceProfile = LIFE_PALACE_PROFILE[lifePalanceBranchKr] || null

    // 명궁 주성 해석
    const lifePalaceStars = (ziwei.keyPalaceStars?.life || []) as Array<{ key: string; kr: string; desc: string }>
    const primaryStar = lifePalaceStars[0] || null
    const starInterp = primaryStar ? (STAR_INTERPRETATION[primaryStar.key] || null) : null

    // 12궁 전체에 주성 매핑
    const palacesWithStars = (ziwei.palaces as Array<Record<string, unknown>>).map((p: Record<string, unknown>) => {
      const palaceIdx = p.idx as number
      const stars = (ziwei.palaceStars as Record<number, Array<{ key: string; kr: string; desc: string }>>)[palaceIdx] || []
      return { ...p, stars }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...ziwei,
        palacesWithStars,
        interpretation: {
          lifePalaceProfile,
          primaryStar: primaryStar ? { ...primaryStar, ...starInterp } : null,
          allLifeStars: lifePalaceStars,
          spouseStars: (ziwei.keyPalaceStars as Record<string, unknown[]>)?.spouse || [],
          careerStars: (ziwei.keyPalaceStars as Record<string, unknown[]>)?.career || [],
        },
        hourBranchIdx,
        inputName: body.name || null,
        _lunarOriginal: data._lunarOriginal || null,
        dayMaster: saju.dayMaster,
      }
    })
  } catch (err) {
    console.error('[ZiWei API Error]', err)
    return NextResponse.json({ success: false, error: '자미두수 계산 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

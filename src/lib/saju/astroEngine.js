/**
 * 서양 점성술 시나스트리(Synastry) 분석 엔진
 *
 * - 양측 행성 차트 계산
 * - 관계 유형별 핵심 상(Aspect) 분석
 * - 시나스트리 점수 산출
 */

const {
  calcFullChart,
  calcAscendant,
  ZODIAC_SIGNS,
  lonToSign
} = require('./astronomy');

// ── 어스펙트(Aspect) 정의 ──────────────────────────────────────────
const ASPECTS = [
  { name: '합(☌)', type: 'conjunction', angle: 0,   orb: 8,  multiplier: 1.0 },
  { name: '충(☍)', type: 'opposition', angle: 180, orb: 8,  multiplier: 0.8 },
  { name: '삼각(△)', type: 'trine',    angle: 120, orb: 6,  multiplier: 0.9 },
  { name: '직각(□)', type: 'square',   angle: 90,  orb: 6,  multiplier: 0.7 },
  { name: '육분(⚹)', type: 'sextile',  angle: 60,  orb: 4,  multiplier: 0.8 },
  { name: '반육분(⚺)', type: 'semisextile', angle: 30, orb: 2, multiplier: 0.5 }
];

// ── 시나스트리 규칙 테이블 ────────────────────────────────────────
// [행성A, 행성B, 어스펙트 타입, 기본 점수, 설명]
const SYNASTRY_RULES = {
  romantic: [
    { pA: 'venus', pB: 'mars',  aspects: ['conjunction'], score: 22, nature: '길', desc: '금성-화성 합: 강한 이성적 끌림과 열정. 낭만적 매력의 핵심 지표.' },
    { pA: 'venus', pB: 'mars',  aspects: ['trine','sextile'], score: 16, nature: '길', desc: '금성-화성 삼각/육분: 자연스러운 이성 관계. 갈등 없는 끌림.' },
    { pA: 'venus', pB: 'mars',  aspects: ['square','opposition'], score: 8, nature: '중', desc: '금성-화성 직각/충: 강한 끌림이나 긴장과 충돌 동반.' },
    { pA: 'sun',   pB: 'moon',  aspects: ['conjunction'], score: 20, nature: '길', desc: '태양-달 합: 근본적 상호 이해. 자연스러운 동반자 관계.' },
    { pA: 'sun',   pB: 'moon',  aspects: ['trine','sextile'], score: 15, nature: '길', desc: '태양-달 삼각/육분: 감정적 조화. 서로를 편안하게 느낌.' },
    { pA: 'sun',   pB: 'moon',  aspects: ['opposition'], score: 10, nature: '중', desc: '태양-달 충: 보완적 끌림. 서로 다름에서 오는 매력.' },
    { pA: 'moon',  pB: 'moon',  aspects: ['conjunction','trine','sextile'], score: 14, nature: '길', desc: '달-달 조화: 감정적 공감 탁월. 일상 생활의 편안함.' },
    { pA: 'moon',  pB: 'moon',  aspects: ['square','opposition'], score: -8, nature: '흉', desc: '달-달 긴장: 감정적 엇갈림. 생활 리듬 충돌.' },
    { pA: 'venus', pB: 'venus', aspects: ['conjunction','trine','sextile'], score: 12, nature: '길', desc: '금성-금성 조화: 취향·미감·가치관 일치. 즐거운 교류.' },
    { pA: 'venus', pB: 'jupiter',aspects: ['conjunction','trine','sextile'], score: 12, nature: '길', desc: '금성-목성 조화: 관대함과 사랑. 상대방이 행복하게 해줌.' },
    { pA: 'venus', pB: 'saturn', aspects: ['conjunction','square','opposition'], score: -10, nature: '흉', desc: '금성-토성 긴장: 감정 억제·책임감. 관계에 거리감 형성.' },
    { pA: 'saturn',pB: 'saturn', aspects: ['square','opposition'], score: -8, nature: '흉', desc: '토성-토성 충돌: 세대·가치관 차이. 서로를 제약.' },
    { pA: 'mars',  pB: 'mars',  aspects: ['square','opposition'], score: -5, nature: '중', desc: '화성-화성 긴장: 에너지 충돌. 권력 다툼 주의.' },
    { pA: 'sun',   pB: 'venus', aspects: ['conjunction','trine','sextile'], score: 14, nature: '길', desc: '태양-금성 조화: 상대방이 이상형에 가까운 느낌. 호감 강함.' },
    { pA: 'sun',   pB: 'jupiter',aspects: ['conjunction','trine'], score: 10, nature: '길', desc: '태양-목성 조화: 서로 성장하고 확장하는 에너지.' }
  ],
  work: [
    { pA: 'sun',   pB: 'sun',  aspects: ['conjunction'], score: 12, nature: '길', desc: '태양-태양 합: 목적과 정체성 일치. 강력한 업무 파트너십.' },
    { pA: 'mercury',pB:'mercury',aspects:['conjunction','trine','sextile'],score:16,nature:'길',desc:'수성-수성 조화: 사고방식 공유. 소통·협업 최상.' },
    { pA: 'mercury',pB:'mercury',aspects:['square','opposition'],score:-8,nature:'흉',desc:'수성-수성 긴장: 의사소통 방식 충돌. 오해 빈발.' },
    { pA: 'saturn',pB: 'sun',  aspects: ['conjunction','trine'], score: 14, nature: '길', desc: '토성-태양 조화: 구조와 목표의 결합. 장기 프로젝트에 이상적.' },
    { pA: 'saturn',pB: 'sun',  aspects: ['square','opposition'], score: -10, nature: '흉', desc: '토성-태양 긴장: 상급자 억압 또는 구조적 갈등.' },
    { pA: 'jupiter',pB:'jupiter',aspects:['conjunction','trine'],score:10,nature:'길',desc:'목성-목성 조화: 공통된 비전. 협업 시 확장 에너지.' },
    { pA: 'mars',  pB: 'saturn',aspects:['square','opposition'],score:-8,nature:'흉',desc:'화성-토성 긴장: 실행력과 제약의 충돌. 진행 방해.' },
    { pA: 'mercury',pB:'saturn', aspects:['conjunction','trine'], score: 12, nature: '길', desc: '수성-토성 조화: 체계적 소통. 분석과 계획의 결합.' },
    { pA: 'venus', pB: 'jupiter',aspects:['conjunction','trine'], score: 8, nature: '길', desc: '금성-목성 조화: 원만한 인간관계. 팀 분위기 향상.' },
    { pA: 'sun',   pB: 'mercury',aspects:['conjunction','sextile'],score:10,nature:'길',desc:'태양-수성 조화: 리더와 전략가의 결합.' }
  ],
  parent_child: [
    { pA: 'sun',   pB: 'moon', aspects: ['conjunction','trine','sextile'],score:18,nature:'길',desc:'태양-달 조화: 본질적 보호와 양육 에너지. 깊은 정서적 연결.' },
    { pA: 'moon',  pB: 'moon', aspects: ['conjunction','trine'], score: 16, nature: '길', desc: '달-달 조화: 감정적 유사성. 직관적으로 상대를 이해.' },
    { pA: 'saturn',pB: 'moon', aspects: ['conjunction','square'], score: -12, nature: '흉', desc: '토성-달 긴장: 감정 억압·냉랭함. 정서적 거리감 주의.' },
    { pA: 'jupiter',pB:'moon', aspects: ['conjunction','trine'], score: 14, nature: '길', desc: '목성-달 조화: 따뜻한 지지와 격려. 성장 지원.' },
    { pA: 'venus', pB: 'moon', aspects: ['conjunction','trine','sextile'],score:12,nature:'길',desc:'금성-달 조화: 애정과 공감. 관계의 부드러움.' },
    { pA: 'sun',   pB: 'saturn',aspects:['square','opposition'],score:-8,nature:'흉',desc:'태양-토성 긴장: 권위 갈등. 자율성 vs 통제.' },
    { pA: 'mercury',pB:'moon', aspects: ['trine','sextile'], score: 10, nature: '길', desc: '수성-달 조화: 대화와 감정 공유. 소통 원활.' }
  ]
};

// ── 어스펙트 계산 함수 ────────────────────────────────────────────

/**
 * 두 행성 황경 간의 어스펙트 결정
 */
function calcAspect(lonA, lonB) {
  let diff = Math.abs(lonA - lonB);
  if (diff > 180) diff = 360 - diff;

  for (const aspect of ASPECTS) {
    const delta = Math.abs(diff - aspect.angle);
    if (delta <= aspect.orb) {
      return {
        ...aspect,
        diff,
        delta,
        strength: 1 - (delta / aspect.orb), // 0~1 (1이 정확한 합)
        isHarmonious: ['trine', 'sextile', 'semisextile'].includes(aspect.type),
        isTense: ['square', 'opposition'].includes(aspect.type)
      };
    }
  }
  return null;
}

/**
 * 두 차트 간 시나스트리 전체 어스펙트 계산
 */
function calcSynastryAspects(chartA, chartB) {
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const aspects = [];

  for (const pA of planets) {
    for (const pB of planets) {
      if (!chartA[pA] || !chartB[pB]) continue;
      const aspect = calcAspect(chartA[pA].lon, chartB[pB].lon);
      if (aspect) {
        aspects.push({
          planetA: pA,
          planetB: pB,
          planetAKr: PLANET_KR[pA],
          planetBKr: PLANET_KR[pB],
          ...aspect
        });
      }
    }
  }

  return aspects;
}

const PLANET_KR = {
  sun: '태양(☉)', moon: '달(☽)', mercury: '수성(☿)',
  venus: '금성(♀)', mars: '화성(♂)', jupiter: '목성(♃)', saturn: '토성(♄)'
};

// ── 시나스트리 점수 계산 ──────────────────────────────────────────

/**
 * 관계 유형별 시나스트리 점수 계산
 * @param {object} chartA, chartB
 * @param {string} relType - 'romantic'|'work'|'parent_child'
 */
function calcSynastryScore(chartA, chartB, relType) {
  const rules = SYNASTRY_RULES[relType] || SYNASTRY_RULES.romantic;
  const synastryAspects = calcSynastryAspects(chartA, chartB);

  let totalScore = 50; // 기본 점수
  const matchedFactors = [];
  const warnings = [];

  for (const rule of rules) {
    // A→B 방향
    if (chartA[rule.pA] && chartB[rule.pB]) {
      const aspect = calcAspect(chartA[rule.pA].lon, chartB[rule.pB].lon);
      if (aspect && rule.aspects.includes(aspect.type)) {
        const actualScore = Math.round(rule.score * aspect.strength);
        totalScore += actualScore;
        const entry = {
          pairKr: `A ${PLANET_KR[rule.pA]} ↔ B ${PLANET_KR[rule.pB]}`,
          aspect: aspect.name,
          score: actualScore,
          nature: rule.nature,
          desc: rule.desc
        };
        if (rule.nature === '흉') warnings.push(entry);
        else matchedFactors.push(entry);
      }
    }

    // B→A 방향 (역방향도 체크)
    if (chartB[rule.pA] && chartA[rule.pB]) {
      const aspect = calcAspect(chartB[rule.pA].lon, chartA[rule.pB].lon);
      if (aspect && rule.aspects.includes(aspect.type)) {
        const actualScore = Math.round(rule.score * aspect.strength * 0.8); // 역방향 80% 가중
        totalScore += actualScore;
        const entry = {
          pairKr: `B ${PLANET_KR[rule.pA]} ↔ A ${PLANET_KR[rule.pB]}`,
          aspect: aspect.name,
          score: actualScore,
          nature: rule.nature,
          desc: rule.desc
        };
        if (rule.nature === '흉') warnings.push(entry);
        else matchedFactors.push(entry);
      }
    }
  }

  // 점수 정규화 (0~100)
  const normalizedScore = Math.max(0, Math.min(100, totalScore));

  // 태양 부호 호환성 (원소별)
  const sunSignCompat = calcSunSignCompat(chartA.sun.signIdx, chartB.sun.signIdx);
  totalScore += sunSignCompat.score;

  return {
    score: Math.max(0, Math.min(100, totalScore)),
    rawScore: totalScore,
    matchedFactors: matchedFactors.sort((a, b) => b.score - a.score).slice(0, 5),
    warnings: warnings.sort((a, b) => a.score - b.score).slice(0, 3),
    sunSignCompat,
    allAspects: synastryAspects.slice(0, 10)
  };
}

/**
 * 태양 부호(황도12궁) 원소 호환성
 */
function calcSunSignCompat(signIdxA, signIdxB) {
  // 원소 분류: 불(0,4,8), 땅(1,5,9), 바람(2,6,10), 물(3,7,11)
  const elementA = signIdxA % 4;
  const elementB = signIdxB % 4;
  const SIGN_ELEMENTS = ['불', '땅', '바람', '물'];

  let score = 0;
  let desc = '';

  if (elementA === elementB) {
    score = 10;
    desc = `같은 ${SIGN_ELEMENTS[elementA]}의 원소 부호. 근본적 기질 일치.`;
  } else if ((elementA + 2) % 4 === elementB) {
    score = 8;
    desc = `보완적 원소(${SIGN_ELEMENTS[elementA]}·${SIGN_ELEMENTS[elementB]}). 서로 다른 관점이 시너지 창출.`;
  } else if ((elementA === 0 && elementB === 2) || (elementA === 2 && elementB === 0)) {
    score = 6;
    desc = '불과 바람: 에너지와 아이디어의 결합. 활발한 상호작용.';
  } else {
    score = 2;
    desc = `이질적 원소(${SIGN_ELEMENTS[elementA]}·${SIGN_ELEMENTS[elementB]}). 상호 보완 가능하나 초기 적응 필요.`;
  }

  // 같은 부호 (합: Conjunction)
  if (signIdxA === signIdxB) {
    score = 12;
    desc = '동일 태양 부호. 기질·목표·자아 표현 방식이 매우 유사.';
  }

  // 충 부호 (Opposition: 6 signs apart)
  if (Math.abs(signIdxA - signIdxB) === 6) {
    score = 5;
    desc = '대극 부호(충). 서로를 완성시키는 반대 에너지. 끌림과 긴장 공존.';
  }

  // 삼각 부호 (Trine: 4 signs apart, same element)
  if (Math.abs(signIdxA - signIdxB) === 4 || Math.abs(signIdxA - signIdxB) === 8) {
    score = 10;
    desc = '삼각 부호(트라인). 같은 원소의 조화로운 연결. 자연스러운 이해.';
  }

  return {
    signA: ZODIAC_SIGNS[signIdxA],
    signB: ZODIAC_SIGNS[signIdxB],
    score,
    desc
  };
}

/**
 * 행성 차트 분석 (개인 특성 요약)
 */
function analyzePersonalChart(chart, gender = null) {
  const traits = [];

  // 태양 부호 해석
  const sunTraits = SUN_SIGN_TRAITS[chart.sun.signIdx];
  if (sunTraits) traits.push({ category: '핵심 정체성', ...sunTraits });

  // 달 부호 해석
  const moonTraits = MOON_SIGN_TRAITS[chart.moon.signIdx];
  if (moonTraits) traits.push({ category: '감정 방식', ...moonTraits });

  // 금성 (연애 스타일)
  const venusTraits = VENUS_SIGN_TRAITS[chart.venus.signIdx];
  if (venusTraits) traits.push({ category: '사랑 표현', ...venusTraits });

  return {
    chart,
    traits,
    sunSign: chart.sun,
    moonSign: chart.moon,
    venusSign: chart.venus,
    marsSign: chart.mars
  };
}

// ── 부호별 특성 테이블 ────────────────────────────────────────────
const SUN_SIGN_TRAITS = [
  { sign: '양자리', keyword: '선도·용기', desc: '즉각적 행동력. 첫 번째가 되고자 함. 직접적이고 솔직.' },
  { sign: '황소자리', keyword: '안정·감각', desc: '물질적 안정 추구. 믿음직스럽고 끈기 있음. 변화 저항.' },
  { sign: '쌍둥이자리', keyword: '소통·다양성', desc: '빠른 두뇌. 다재다능. 지루함 회피. 표면적 폭넓음.' },
  { sign: '게자리', keyword: '보호·감성', desc: '강한 감성·직관. 가정 중시. 기억력 뛰어남. 방어적.' },
  { sign: '사자자리', keyword: '표현·자존', desc: '무대 중심 성향. 창의력. 자기 표현 강렬. 인정 욕구.' },
  { sign: '처녀자리', keyword: '분석·서비스', desc: '완벽주의. 세부 분석. 실용적 접근. 비판적 경향.' },
  { sign: '천칭자리', keyword: '균형·관계', desc: '공정성 추구. 미적 감각. 결정 어려움. 파트너십 중시.' },
  { sign: '전갈자리', keyword: '심층·변환', desc: '심리적 통찰. 강렬한 감정. 비밀 유지. 집착 경향.' },
  { sign: '사수자리', keyword: '자유·철학', desc: '이상주의. 직설적. 광범위한 관심. 약속 이행 약점.' },
  { sign: '염소자리', keyword: '목표·지구력', desc: '목표 지향. 자기 통제. 책임감. 감정 표현 절제.' },
  { sign: '물병자리', keyword: '혁신·독립', desc: '독창성. 인류적 관점. 감정 분리. 개혁 성향.' },
  { sign: '물고기자리', keyword: '공감·직관', desc: '강한 공감 능력. 예술적. 경계 모호. 이상주의.' }
];

const MOON_SIGN_TRAITS = [
  { sign: '양자리달', keyword: '즉각적 감정', desc: '감정이 즉각적으로 폭발. 금방 흥분하고 금방 잊음.' },
  { sign: '황소자리달', keyword: '안정적 감정', desc: '감정이 안정적이고 일관됨. 물질적 안락함에서 위안.' },
  { sign: '쌍둥이자리달', keyword: '이성적 감정', desc: '감정을 언어로 처리. 대화로 관계 유지.' },
  { sign: '게자리달', keyword: '공감 능력', desc: '뛰어난 공감 능력. 타인의 기분에 민감. 돌봄 본능.' },
  { sign: '사자자리달', keyword: '극적 감정', desc: '감정 표현이 크고 극적. 인정받을 때 안정.' },
  { sign: '처녀자리달', keyword: '분석적 감정', desc: '감정을 분석하고 통제. 서비스로 사랑 표현.' },
  { sign: '천칭자리달', keyword: '조화 추구', desc: '갈등 회피. 파트너와의 조화에서 감정 안정.' },
  { sign: '전갈자리달', keyword: '심층 감정', desc: '강렬하고 깊은 감정. 신뢰 관계 없이는 표현 안 함.' },
  { sign: '사수자리달', keyword: '자유로운 감정', desc: '감정에 얽매이지 않음. 낙관적이고 유머 감각 탁월.' },
  { sign: '염소자리달', keyword: '절제된 감정', desc: '감정 통제 강함. 책임으로 사랑 표현. 차갑게 보일 수 있음.' },
  { sign: '물병자리달', keyword: '분리된 감정', desc: '감정을 객관적으로 봄. 독립성 요구. 개인 공간 필수.' },
  { sign: '물고기자리달', keyword: '유동적 감정', desc: '감수성 극도로 풍부. 경계 불명확. 흡수적 공감.' }
];

const VENUS_SIGN_TRAITS = [
  { sign: '양자리금성', keyword: '직접적 사랑', desc: '적극적이고 직접적. 첫눈에 반함. 열정적이나 식을 수 있음.' },
  { sign: '황소자리금성', keyword: '감각적 사랑', desc: '물질적·감각적 사랑. 천천히 깊어짐. 매우 충실.' },
  { sign: '쌍둥이자리금성', keyword: '지적 사랑', desc: '대화와 지적 자극으로 사랑. 변덕스러울 수 있음.' },
  { sign: '게자리금성', keyword: '보호적 사랑', desc: '헌신적이고 감성적. 가정 중심. 과거 집착 경향.' },
  { sign: '사자자리금성', keyword: '극적 사랑', desc: '화려하고 로맨틱한 사랑. 헌신 기대. 자존심 강.' },
  { sign: '처녀자리금성', keyword: '실용적 사랑', desc: '실질적 도움으로 사랑 표현. 작은 배려에 집중.' },
  { sign: '천칭자리금성', keyword: '균형 잡힌 사랑', desc: '조화롭고 세련된 관계 추구. 공정함 중시.' },
  { sign: '전갈자리금성', keyword: '심층적 사랑', desc: '강렬하고 독점적. 완전한 신뢰를 원함.' },
  { sign: '사수자리금성', keyword: '자유로운 사랑', desc: '모험과 성장을 함께하는 사랑. 속박 싫어함.' },
  { sign: '염소자리금성', keyword: '헌신적 사랑', desc: '장기적이고 책임감 있는 관계. 현실적 사랑.' },
  { sign: '물병자리금성', keyword: '우정적 사랑', desc: '우정 기반. 독립성 존중. 독창적 방식으로 사랑.' },
  { sign: '물고기자리금성', keyword: '이상적 사랑', desc: '낭만적 이상주의. 무한한 공감. 경계 없는 사랑.' }
];

/**
 * 점성술 궁합 풀 분석
 */
function analyzeAstrologyCompat(birthDataA, birthDataB, jdA, jdB, relType) {
  const chartA = calcFullChart(jdA);
  const chartB = calcFullChart(jdB);

  const synastry = calcSynastryScore(chartA, chartB, relType);
  const personalA = analyzePersonalChart(chartA);
  const personalB = analyzePersonalChart(chartB);

  return {
    chartA,
    chartB,
    personalA,
    personalB,
    synastry,
    score: synastry.score
  };
}

module.exports = {
  calcSynastryAspects,
  calcSynastryScore,
  calcAspect,
  calcSunSignCompat,
  analyzePersonalChart,
  analyzeAstrologyCompat,
  SUN_SIGN_TRAITS,
  MOON_SIGN_TRAITS,
  VENUS_SIGN_TRAITS,
  PLANET_KR
};

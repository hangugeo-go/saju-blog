/**
 * MBTI 궁합 분석 엔진
 *
 * 인지기능 스택(Cognitive Function Stack) 기반 호환성 분석
 * 16가지 MBTI 유형 × 관계 유형별 가중 점수 산출
 * 자기보고식 데이터이므로 역학 시스템과 독립적으로 처리 후 통합
 */

// ── 16가지 MBTI 유형 정의 ──────────────────────────────────────────
const MBTI_TYPES = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP'
];

// ── 인지기능 스택 (Dominant → Auxiliary → Tertiary → Inferior) ─────
const COGNITIVE_STACK = {
  INTJ: ['Ni', 'Te', 'Fi', 'Se'],
  INTP: ['Ti', 'Ne', 'Si', 'Fe'],
  ENTJ: ['Te', 'Ni', 'Se', 'Fi'],
  ENTP: ['Ne', 'Ti', 'Fe', 'Si'],
  INFJ: ['Ni', 'Fe', 'Ti', 'Se'],
  INFP: ['Fi', 'Ne', 'Si', 'Te'],
  ENFJ: ['Fe', 'Ni', 'Se', 'Ti'],
  ENFP: ['Ne', 'Fi', 'Te', 'Si'],
  ISTJ: ['Si', 'Te', 'Fi', 'Ne'],
  ISFJ: ['Si', 'Fe', 'Ti', 'Ne'],
  ESTJ: ['Te', 'Si', 'Ne', 'Fi'],
  ESFJ: ['Fe', 'Si', 'Ne', 'Ti'],
  ISTP: ['Ti', 'Se', 'Ni', 'Fe'],
  ISFP: ['Fi', 'Se', 'Ni', 'Te'],
  ESTP: ['Se', 'Ti', 'Fe', 'Ni'],
  ESFP: ['Se', 'Fi', 'Te', 'Ni']
};

// ── 유형 그룹 ─────────────────────────────────────────────────────
const MBTI_GROUP = {
  INTJ: 'NT분석가', INTP: 'NT분석가', ENTJ: 'NT분석가', ENTP: 'NT분석가',
  INFJ: 'NF외교관', INFP: 'NF외교관', ENFJ: 'NF외교관', ENFP: 'NF외교관',
  ISTJ: 'SJ관리자', ISFJ: 'SJ관리자', ESTJ: 'SJ관리자', ESFJ: 'SJ관리자',
  ISTP: 'SP탐험가', ISFP: 'SP탐험가', ESTP: 'SP탐험가', ESFP: 'SP탐험가'
};

// ── 유형별 핵심 성향 요약 ─────────────────────────────────────────
const MBTI_PROFILE = {
  INTJ: { title: '전략가',    core: '독립적 계획자. 장기 비전 중심. 감정 표현 절제. 효율 우선.', strength: '전략·독립·집중', weakness: '완고함·감정 무시·고립' },
  INTP: { title: '논리술사',  core: '분석·논리 최우선. 이론 탐구 선호. 사회적 의무에 무관심.', strength: '분석·창의·독립사고', weakness: '우유부단·냉담·실행력 부족' },
  ENTJ: { title: '지휘관',    core: '리더십·목표 지향. 결정적이고 직접적. 타인 주도 경향.', strength: '리더십·효율·추진력', weakness: '독단·공감 부족·지배욕' },
  ENTP: { title: '변론가',    core: '아이디어 탐구자. 논쟁 즐김. 루틴 거부. 독창성 우선.', strength: '창의·논리·열린사고', weakness: '일관성 부족·도발·마무리 약함' },
  INFJ: { title: '옹호자',    core: '깊은 통찰과 공감. 타인 지향적이나 내향적. 이상 추구.', strength: '통찰·공감·헌신', weakness: '완벽주의·소진·폐쇄' },
  INFP: { title: '중재자',    core: '깊은 감성·가치관. 진정성 추구. 외부 압력에 민감.', strength: '공감·창의·충실성', weakness: '비현실적·감정 기복·우유부단' },
  ENFJ: { title: '선도자',    core: '타인 성장 지원. 카리스마. 관계 조화 중시. 희생 경향.', strength: '리더십·공감·소통', weakness: '지나친 자기희생·집착·비판 민감' },
  ENFP: { title: '활동가',    core: '열정·가능성 탐구. 감성적·사교적. 루틴 회피.', strength: '창의·열정·공감', weakness: '산만·감정 과부하·이행력 약함' },
  ISTJ: { title: '현실주의자', core: '책임·신뢰·규칙 준수. 조용하고 성실. 전통 중시.', strength: '신뢰성·성실·조직력', weakness: '융통성 부족·완고·감정 표현 약함' },
  ISFJ: { title: '수호자',    core: '헌신적 보호자. 세심하고 충실. 변화에 저항.', strength: '헌신·세심함·안정성', weakness: '자기주장 약함·과부하·변화 기피' },
  ESTJ: { title: '경영자',    core: '질서·규칙 집행. 실용적 리더. 전통과 효율 중시.', strength: '조직력·리더십·신뢰성', weakness: '융통성 부족·감정 무시·독단' },
  ESFJ: { title: '집정관',    core: '사교적 배려자. 조화·인정 추구. 타인 감정에 민감.', strength: '배려·사교성·충실성', weakness: '비판 민감·의존성·갈등 회피' },
  ISTP: { title: '장인',      core: '실용적 분석가. 즉각 문제 해결. 자유·효율 중시.', strength: '분석·실용·자율성', weakness: '감정 표현 극히 낮음·무관심·위험감수' },
  ISFP: { title: '모험가',    core: '예술적 감성. 현재 중심. 자유로운 표현. 비갈등 성향.', strength: '감성·유연성·충실성', weakness: '갈등 회피·계획 부재·자기주장 약함' },
  ESTP: { title: '사업가',    core: '행동 지향. 현실 감각. 즉흥적·사교적. 규칙 저항.', strength: '행동력·현실감·사교성', weakness: '충동적·감정 무시·장기 계획 약함' },
  ESFP: { title: '연예인',    core: '삶을 즐기는 자. 사교적·즉흥적. 타인 에너지 흡수.', strength: '활력·사교성·공감', weakness: '집중력 부족·갈등 회피·계획 없음' }
};

// ── 인지기능 설명 ──────────────────────────────────────────────────
const FUNCTION_DESC = {
  Ni: '내향 직관: 패턴 통찰, 미래 예측, 심층 의미 탐구',
  Ne: '외향 직관: 가능성 탐구, 아이디어 연결, 발산적 사고',
  Si: '내향 감각: 과거 경험 참조, 안정·루틴 선호, 세부 기억',
  Se: '외향 감각: 현재 환경 인식, 즉각 반응, 감각적 경험',
  Ti: '내향 사고: 내적 논리 체계, 분석·원리 탐구, 독립적 판단',
  Te: '외향 사고: 외부 효율·목표, 시스템 구축, 직접적 실행',
  Fi: '내향 감정: 내적 가치관, 진정성 추구, 개인 윤리',
  Fe: '외향 감정: 집단 조화, 타인 감정 인식, 사회적 유대'
};

// ── 인지기능 호환성 행렬 ───────────────────────────────────────────
// [함수A][함수B] = 호환점수 (0~10)
// 같은 함수 = 10, 축(axis) 동일 = 8, 보완 = 6, 중립 = 4, 갈등 = 2
const FUNCTION_COMPAT = {
  Ni: { Ni:10, Ne:4, Si:6, Se:2, Ti:6, Te:4, Fi:7, Fe:3 },
  Ne: { Ni:4, Ne:10, Si:2, Se:6, Ti:7, Te:5, Fi:5, Fe:5 },
  Si: { Ni:6, Ne:2, Si:10, Se:4, Ti:4, Te:6, Fi:7, Fe:5 },
  Se: { Ni:2, Ne:6, Si:4, Se:10, Ti:5, Te:5, Fi:3, Fe:7 },
  Ti: { Ni:6, Ne:7, Si:4, Se:5, Ti:10, Te:4, Fi:3, Fe:6 },
  Te: { Ni:4, Ne:5, Si:6, Se:5, Ti:4, Te:10, Fi:3, Fe:5 },
  Fi: { Ni:7, Ne:5, Si:7, Se:3, Ti:3, Te:3, Fi:10, Fe:4 },
  Fe: { Ni:3, Ne:5, Si:5, Se:7, Ti:6, Te:5, Fi:4, Fe:10 }
};

// ── 알려진 관계 유형 ────────────────────────────────────────────────
// [typeA][typeB] → { type: 관계유형명, score: 0~100, desc: 설명 }
// 대표적 관계 유형 쌍
function getKnownRelationType(a, b) {
  const pair = `${a}-${b}`;
  const pairRev = `${b}-${a}`;
  const KNOWN = {
    // Golden Pair (서로의 주·부기능이 상대의 부·주기능) - 최고 궁합
    'INTJ-ENFP': { type: '황금쌍(Golden Pair)', score: 92, label: '최상' },
    'INTP-ENFJ': { type: '황금쌍(Golden Pair)', score: 90, label: '최상' },
    'ENTJ-INFP': { type: '황금쌍(Golden Pair)', score: 90, label: '최상' },
    'ENTP-INFJ': { type: '황금쌍(Golden Pair)', score: 92, label: '최상' },
    'ISTJ-ESFP': { type: '황금쌍(Golden Pair)', score: 85, label: '최상' },
    'ISFJ-ESTP': { type: '황금쌍(Golden Pair)', score: 85, label: '최상' },
    'ESTJ-ISFP': { type: '황금쌍(Golden Pair)', score: 85, label: '최상' },
    'ESFJ-ISTP': { type: '황금쌍(Golden Pair)', score: 85, label: '최상' },
    // Companion (같은 그룹, IE만 다름) - 편안한 유사성
    'INTJ-ENTJ': { type: '동반자형', score: 78, label: '양호' },
    'INFP-ENFP': { type: '동반자형', score: 78, label: '양호' },
    'INFJ-ENFJ': { type: '동반자형', score: 76, label: '양호' },
    'INTP-ENTP': { type: '동반자형', score: 76, label: '양호' },
    'ISTJ-ESTJ': { type: '동반자형', score: 75, label: '양호' },
    'ISFJ-ESFJ': { type: '동반자형', score: 75, label: '양호' },
    'ISTP-ESTP': { type: '동반자형', score: 74, label: '양호' },
    'ISFP-ESFP': { type: '동반자형', score: 74, label: '양호' },
    // Pedagogue (선생-학생 역학) - 성장 관계
    'INTJ-INFJ': { type: '멘토형', score: 74, label: '양호' },
    'ENTJ-ENFJ': { type: '멘토형', score: 74, label: '양호' },
    'INTP-ISTP': { type: '멘토형', score: 72, label: '양호' },
    'ENTP-ESTP': { type: '멘토형', score: 72, label: '양호' },
    // Same type - 완전 동일
    'INTJ-INTJ': { type: '동형(同型)', score: 70, label: '이해 쉬움' },
    'INFP-INFP': { type: '동형(同型)', score: 68, label: '이해 쉬움' },
    'ENFP-ENFP': { type: '동형(同型)', score: 68, label: '이해 쉬움' },
  };
  return KNOWN[pair] || KNOWN[pairRev] || null;
}

// ── MBTI 4차원 분석 ────────────────────────────────────────────────

function getDimensions(type) {
  return {
    EI: type[0],  // E or I
    NS: type[1],  // N or S
    TF: type[2],  // T or F
    JP: type[3]   // J or P
  };
}

function analyzeDimensions(typeA, typeB) {
  const dA = getDimensions(typeA);
  const dB = getDimensions(typeB);
  const results = [];

  // E/I - 에너지 방향
  if (dA.EI === dB.EI) {
    results.push({
      dim: 'E/I',
      match: '동일',
      score: 6,
      desc: dA.EI === 'E'
        ? '둘 다 외향형. 활동적이고 사교적. 에너지는 충만하나 조용한 시간 확보 필요.'
        : '둘 다 내향형. 깊고 조용한 교류 선호. 사교적 상황에서 서로 이해.'
    });
  } else {
    results.push({
      dim: 'E/I',
      match: '보완',
      score: 8,
      desc: '외향(E)과 내향(I)의 보완 관계. 균형 있는 사회-개인 시간 조율이 핵심. 에너지 소모 방식이 달라 갈등 가능.'
    });
  }

  // N/S - 정보 처리
  if (dA.NS === dB.NS) {
    results.push({
      dim: 'N/S',
      match: '동일',
      score: 8,
      desc: dA.NS === 'N'
        ? '둘 다 직관형(N). 미래·가능성 중심 대화. 추상적 개념 공유 쉬움. 현실 문제 간과 주의.'
        : '둘 다 감각형(S). 현실·구체적 정보 중시. 실용적 소통. 새 아이디어 수용 느릴 수 있음.'
    });
  } else {
    results.push({
      dim: 'N/S',
      match: '이질',
      score: 4,
      desc: '직관형(N)과 감각형(S)의 차이. 정보 처리 방식이 근본적으로 다름. 대화 시 서로 다른 차원에서 이야기할 위험.'
    });
  }

  // T/F - 의사결정
  if (dA.TF === dB.TF) {
    results.push({
      dim: 'T/F',
      match: '동일',
      score: 6,
      desc: dA.TF === 'T'
        ? '둘 다 사고형(T). 논리·효율 중심 소통. 감정 다툼 적으나 공감 표현 부족할 수 있음.'
        : '둘 다 감정형(F). 공감·관계 중시. 갈등 시 감정적 순환에 빠질 위험.'
    });
  } else {
    results.push({
      dim: 'T/F',
      match: '보완',
      score: 7,
      desc: '사고형(T)과 감정형(F)의 보완. T가 논리를, F가 공감을 담당하면 균형 있는 결정 가능. 단 F는 T의 냉담함에, T는 F의 감정 우선주의에 마찰.'
    });
  }

  // J/P - 생활 방식
  if (dA.JP === dB.JP) {
    results.push({
      dim: 'J/P',
      match: '동일',
      score: 7,
      desc: dA.JP === 'J'
        ? '둘 다 판단형(J). 계획·구조 선호. 안정적이나 유연성 부족 시 경직.'
        : '둘 다 인식형(P). 유연하고 즉흥적. 자유로운 관계이나 결정 미루기와 마무리 부재 주의.'
    });
  } else {
    results.push({
      dim: 'J/P',
      match: '이질',
      score: 5,
      desc: '판단형(J)과 인식형(P)의 차이. J는 계획·마감을, P는 유연성·가능성을 선호. 일정·약속 처리에서 반복 충돌 가능.'
    });
  }

  return results;
}

// ── 인지기능 스택 호환성 계산 ──────────────────────────────────────

function analyzeCognitiveFunctions(typeA, typeB) {
  const stackA = COGNITIVE_STACK[typeA];
  const stackB = COGNITIVE_STACK[typeB];
  if (!stackA || !stackB) return { score: 50, details: [] };

  const details = [];
  let totalScore = 0;
  const weights = [0.4, 0.3, 0.2, 0.1]; // Dom, Aux, Tert, Inf

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const fA = stackA[i];
      const fB = stackB[j];
      const compat = FUNCTION_COMPAT[fA]?.[fB] ?? 5;
      const weight = weights[i] * weights[j];
      totalScore += compat * weight;

      // 주요 기능 쌍만 상세 기록 (Dom-Dom, Dom-Aux, Aux-Dom)
      if ((i === 0 && j === 0) || (i === 0 && j === 1) || (i === 1 && j === 0)) {
        details.push({
          funcA: fA, funcB: fB,
          label: i === 0 && j === 0 ? '주기능↔주기능' : i === 0 ? 'A주기능↔B부기능' : 'A부기능↔B주기능',
          compat,
          descA: FUNCTION_DESC[fA],
          descB: FUNCTION_DESC[fB]
        });
      }
    }
  }

  // 정규화: 최대값(10) 기준 0~100
  const normalized = (totalScore / 10) * 100;

  // 특수 패턴: 주기능-부기능 교차 (Golden Pair 특성)
  const isGoldenAxis =
    (stackA[0] === stackB[1] && stackA[1] === stackB[0]);
  if (isGoldenAxis) {
    details.push({
      funcA: stackA[0], funcB: stackB[0],
      label: '황금축(Golden Axis)',
      compat: 10,
      descA: '주기능·부기능이 교차 일치 — 자연스러운 상호 보완'
    });
  }

  return {
    score: Math.round(Math.max(0, Math.min(100, normalized))),
    isGoldenAxis,
    stackA: stackA.map(f => ({ func: f, desc: FUNCTION_DESC[f] })),
    stackB: stackB.map(f => ({ func: f, desc: FUNCTION_DESC[f] })),
    details
  };
}

// ── 관계 유형별 MBTI 처세 조언 ────────────────────────────────────

function getMbtiAdvice(typeA, typeB, relType) {
  const dA = getDimensions(typeA);
  const dB = getDimensions(typeB);
  const advice = [];

  if (relType === 'romantic') {
    // T/F 차이 - 가장 큰 갈등 원인
    if (dA.TF !== dB.TF) {
      const T = dA.TF === 'T' ? `${typeA}` : `${typeB}`;
      const F = dA.TF === 'F' ? `${typeA}` : `${typeB}`;
      advice.push({
        src: 'T/F 차이',
        text: `${T}(T형)은 갈등 시 논리적 해결을 원하고, ${F}(F형)은 공감·인정을 먼저 원한다. ${T}는 해결책 제시 전 "그 감정이 당연하다"는 확인을 먼저 줄 것.`
      });
    }
    if (dA.JP !== dB.JP) {
      const J = dA.JP === 'J' ? typeA : typeB;
      const P = dA.JP === 'P' ? typeA : typeB;
      advice.push({
        src: 'J/P 차이',
        text: `${J}(J형)의 계획 요구를 ${P}(P형)가 압박으로 느낄 수 있다. 데이트·약속은 최소 기준(날짜만)만 합의하고 세부는 유동적으로 남겨둘 것.`
      });
    }
    if (dA.EI !== dB.EI) {
      const E = dA.EI === 'E' ? typeA : typeB;
      const I = dA.EI === 'I' ? typeA : typeB;
      advice.push({
        src: 'E/I 차이',
        text: `${E}(E형)의 사교 욕구와 ${I}(I형)의 독처 욕구를 주기적으로 조율할 것. ${I}의 침묵은 거부가 아닌 재충전 신호임을 ${E}가 인지해야 함.`
      });
    }
  } else if (relType === 'work') {
    if (dA.JP !== dB.JP) {
      advice.push({
        src: 'J/P 업무 방식',
        text: `J형은 계획·마감 주도, P형은 적응·유연성 제공. 프로젝트 시작 시 마감·산출물은 J형이 설정하고, 방법·과정은 P형에게 위임하는 역할 분리가 효과적.`
      });
    }
    if (dA.TF !== dB.TF) {
      advice.push({
        src: 'T/F 결정 방식',
        text: `T형은 데이터·논리 기반 결정, F형은 사람·조화 기반 결정. 의사결정 시 T형이 분석을, F형이 팀 영향도를 검토하는 역할 분담이 이상적.`
      });
    }
    if (dA.NS !== dB.NS) {
      advice.push({
        src: 'N/S 관점 차이',
        text: `N형은 전략·비전 제시, S형은 실행·세부 구현 담당. 기획 회의에서 N형의 아이디어를 S형이 현실화하는 구조를 설계하면 시너지.`
      });
    }
  } else if (relType === 'parent_child') {
    if (dA.TF !== dB.TF) {
      advice.push({
        src: 'T/F 양육 차이',
        text: `T형 부모·자녀는 논리적 이유를 원하고, F형은 감정적 연결을 원한다. 훈육 시 이유 설명(T 필요)과 감정 인정(F 필요)을 모두 포함할 것.`
      });
    }
    if (dA.JP !== dB.JP) {
      advice.push({
        src: 'J/P 구조 차이',
        text: `J형은 규칙·루틴, P형은 자유·탐색을 선호. 일정한 기본 규칙(J 요구)과 그 안에서의 자유도(P 요구)를 균형 있게 설계할 것.`
      });
    }
    if (dA.EI !== dB.EI) {
      advice.push({
        src: 'E/I 에너지 차이',
        text: `E형은 함께하는 활동을, I형은 혼자 있는 시간을 더 가치 있게 여긴다. 공통 활동과 개인 시간을 모두 확보하는 구조 필요.`
      });
    }
  }

  // 공통 조언 (인지기능 황금축이면)
  const stackA = COGNITIVE_STACK[typeA];
  const stackB = COGNITIVE_STACK[typeB];
  if (stackA && stackB && stackA[0] === stackB[1] && stackA[1] === stackB[0]) {
    advice.unshift({
      src: 'MBTI 황금쌍',
      text: `${typeA}와 ${typeB}는 주기능과 부기능이 교차 일치하는 황금쌍. 서로가 자연스럽게 상대방의 약점을 보완하는 구조. 단 초기 이해 단계에서는 너무 다르게 느껴질 수 있음.`
    });
  }

  if (!advice.length) {
    advice.push({
      src: 'MBTI 일반',
      text: `${typeA}와 ${typeB}의 공통점을 활성화하는 대화 주제를 찾을 것. 차이는 문제가 아니라 역할 분담의 기회로 재해석할 것.`
    });
  }

  return advice.slice(0, 3);
}

// ── 메인 MBTI 궁합 계산 함수 ──────────────────────────────────────

/**
 * @param {string|null} typeA - MBTI 유형 ('INTJ' 등, null이면 스킵)
 * @param {string|null} typeB
 * @param {string} relType - 'romantic'|'work'|'parent_child'
 * @returns {object} MBTI 분석 결과
 */
function analyzeMbtiCompat(typeA, typeB, relType = 'romantic') {
  // 미입력 처리
  if (!typeA || !typeB || !MBTI_TYPES.includes(typeA) || !MBTI_TYPES.includes(typeB)) {
    return { available: false, score: null };
  }

  // 1. 알려진 관계 유형
  const known = getKnownRelationType(typeA, typeB);

  // 2. 인지기능 분석
  const cognitiveResult = analyzeCognitiveFunctions(typeA, typeB);

  // 3. 4차원 분석
  const dimensionResult = analyzeDimensions(typeA, typeB);
  const dimScore = dimensionResult.reduce((s, d) => s + d.score, 0) / dimensionResult.length * 10; // 0~100

  // 4. 최종 점수 계산
  let finalScore;
  if (known) {
    // 알려진 쌍이면 해당 점수 기준으로 인지기능 점수 가중 평균
    finalScore = Math.round(known.score * 0.5 + cognitiveResult.score * 0.3 + dimScore * 0.2);
  } else {
    finalScore = Math.round(cognitiveResult.score * 0.6 + dimScore * 0.4);
  }

  // 5. 처세 조언
  const advice = getMbtiAdvice(typeA, typeB, relType);

  // 6. 개인 프로파일
  const profileA = MBTI_PROFILE[typeA];
  const profileB = MBTI_PROFILE[typeB];

  return {
    available: true,
    typeA,
    typeB,
    score: finalScore,
    knownRelationType: known,
    cognitiveCompat: cognitiveResult,
    dimensionAnalysis: dimensionResult,
    profileA: { type: typeA, group: MBTI_GROUP[typeA], ...profileA },
    profileB: { type: typeB, group: MBTI_GROUP[typeB], ...profileB },
    advice,
    relType
  };
}

module.exports = {
  analyzeMbtiCompat,
  MBTI_TYPES,
  MBTI_PROFILE,
  MBTI_GROUP,
  COGNITIVE_STACK,
  FUNCTION_DESC
};

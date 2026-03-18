/**
 * 역학 데이터 → 실전 처세술 텍스트 변환 매핑 테이블
 *
 * 분석된 수치와 지표들을 구체적인 행동 조언으로 변환한다.
 * 감정적 수식어를 배제하고 직설적이고 실용적인 어조를 유지한다.
 */

// ── 종합 점수별 총평 ──────────────────────────────────────────────
function getOverallComment(score, relType) {
  const comments = {
    romantic: [
      { min: 85, label: '상위 5%', summary: '역학적으로 강한 인연 지표가 다수 발견됨. 단, 모든 지표가 순기능으로 작동하려면 성숙한 감정 조절 능력이 전제되어야 함.' },
      { min: 70, label: '상위 20%', summary: '주요 궁합 요소에서 긍정 신호 우세. 일부 마찰 요소는 서로의 차이를 인정하는 태도로 관리 가능.' },
      { min: 55, label: '평균 수준', summary: '길흉이 혼재. 타고난 인연보다 노력에 의해 관계 품질이 결정되는 유형. 소통 방식 정립이 핵심.' },
      { min: 40, label: '하위 40%', summary: '핵심 충돌 요소가 복수 존재. 관계 유지를 위한 의식적 노력이 지속적으로 필요. 자동으로 잘 되는 관계는 아님.' },
      { min: 0,  label: '하위 20%', summary: '역학적 긴장 요소가 다수. 본인의 의지와 무관하게 갈등 유발 패턴이 반복될 가능성. 해당 관계의 목적과 기대치를 명확히 할 것.' }
    ],
    work: [
      { min: 85, label: '상위 5%', summary: '업무 궁합 최상위. 사고방식, 목표, 소통 방식이 고도로 일치. 협업 프로젝트에서 시너지 효과 기대 가능.' },
      { min: 70, label: '상위 20%', summary: '업무 협력 적합도 높음. 역할 분담이 명확하면 마찰 없이 목표 달성 가능. 보고·결정 체계 합의가 선행되어야 함.' },
      { min: 55, label: '평균 수준', summary: '협업 가능하나 의사소통 방식에서 간헐적 마찰 예상. 업무 목표를 구체적으로 문서화하는 것이 갈등 방지의 핵심.' },
      { min: 40, label: '하위 40%', summary: '업무 방식·우선순위에서 구조적 차이 존재. 지시보다 합의, 독단보다 공유를 원칙으로 관계를 설계할 것.' },
      { min: 0,  label: '하위 20%', summary: '업무 방식의 근본적 불일치. 감정적 통제 없이는 갈등이 성과를 잠식할 위험. 최소한 역할 경계를 명확히 분리해야 함.' }
    ],
    parent_child: [
      { min: 85, label: '상위 5%', summary: '역학적 유대 지표 매우 강함. 자연스러운 신뢰와 정서적 연결. 대화가 잘 통하고 공감 능력이 서로에게 작동.' },
      { min: 70, label: '상위 20%', summary: '관계 기반 탄탄. 세대 차이나 성향 차이가 있더라도 근본적 유대를 바탕으로 해소 가능.' },
      { min: 55, label: '평균 수준', summary: '관계 형성에 의식적 노력 필요. 감정 표현 방식의 차이가 오해로 이어지지 않도록 명시적 소통 권장.' },
      { min: 40, label: '하위 40%', summary: '정서적 단절 위험 요소 존재. 기대치를 낮추고 상대의 언어와 방식을 먼저 이해하는 접근이 효과적.' },
      { min: 0,  label: '하위 20%', summary: '갈등 구조가 역학적으로 내재되어 있음. 상대를 바꾸려는 시도보다 경계를 존중하는 관계 방식으로 재설계 권장.' }
    ]
  };

  const list = comments[relType] || comments.romantic;
  for (const c of list) {
    if (score >= c.min) return c;
  }
  return list[list.length - 1];
}

// ── 오행 부족·과다 → 처세 조언 ────────────────────────────────────
function getElementAdvice(elementCountA, elementCountB) {
  const advice = [];
  const elemNames = ['木(목)', '火(화)', '土(토)', '金(금)', '水(수)'];
  const elemAdvice = {
    0: { excess: 'A는 목(木) 과다: 실행력은 강하나 고집이 세고 타협이 어렵다. B는 자신의 의견을 강요하지 말고 방향성을 먼저 공유할 것.', lack: 'A는 목(木) 부족: 결단력과 추진력이 약할 수 있다. B가 방향을 잡아주는 역할을 하면 시너지가 생긴다.' },
    1: { excess: 'A는 화(火) 과다: 열정적이나 충동적. 장기 계획보다 즉각적 반응을 선호. B는 감정이 격해진 순간에는 즉각 대응하지 말 것.', lack: 'A는 화(火) 부족: 동기 부여가 낮거나 감정 표현이 절제됨. B는 긍정적 자극과 격려를 제공할 것.' },
    2: { excess: 'A는 토(土) 과다: 보수적이고 변화를 싫어함. 관계에서 고착 패턴 주의. B는 새로운 방식을 점진적으로 제안할 것.', lack: 'A는 토(土) 부족: 현실 감각과 안정성이 약함. B는 구체적이고 실용적인 방향을 제시해 줄 것.' },
    3: { excess: 'A는 금(金) 과다: 원칙적이고 냉정. 비판적 발언이 잦을 수 있음. B는 비판을 개인화하지 말고 과제로 받아들일 것.', lack: 'A는 금(金) 부족: 기준이 모호하고 규칙 이행이 약함. B는 명확한 기준을 사전에 합의하는 것이 효과적.' },
    4: { excess: 'A는 수(水) 과다: 사고가 깊고 관찰적이나 우유부단하거나 걱정이 많음. B는 결정을 독촉하지 말고 충분한 생각 시간을 줄 것.', lack: 'A는 수(水) 부족: 직관력과 유연성 부족. 계획에 집착할 수 있음. B는 유동적 상황에서 리드할 것.' }
  };

  for (let i = 0; i < 5; i++) {
    if (elementCountA[i] >= 4) advice.push({ category: '오행 과다 보정', text: elemAdvice[i].excess });
    else if (elementCountA[i] === 0) advice.push({ category: '오행 부족 보완', text: elemAdvice[i].lack });
  }

  return advice.slice(0, 2); // 최대 2개
}

// ── 십성 관계 → 처세 조언 ─────────────────────────────────────────
function getTenGodAdvice(tenGodRelation, relType) {
  const AtoB = tenGodRelation.AtoB.tenGod;
  const BtoA = tenGodRelation.BtoA.tenGod;

  const adviceMap = {
    romantic: {
      '정관-정재': 'A(정재)가 B(정관)를 물질적으로 지지하고, B가 A에게 안정과 신뢰를 제공하는 고전적 상호 보완 관계. 역할 분리가 명확하면 안정적.',
      '식신-정관': '식신(A)의 창의성과 정관(B)의 통제력이 결합. A는 자유로운 표현을 원하고 B는 질서를 원함. 상대방의 방식을 존중하는 훈련이 필요.',
      '편관-정재': '편관과 정재의 만남: 강한 긴장감과 에너지. 한쪽이 지배적이 되지 않도록 권력 균형 의식적 관리 요.',
      default: `A가 B를 '${AtoB}'으로, B가 A를 '${BtoA}'으로 봄. 서로의 역할 기대를 명확히 공유할 것.`
    },
    work: {
      '정관-비견': '상하 관계에서 비견(동등 경쟁)은 마찰의 원인. 권한 범위를 명확히 문서화할 것.',
      '편관-식신': '강한 통제(편관) 아래 창의성(식신)이 억눌릴 수 있음. 자율성 부여 여부가 성과를 결정함.',
      '정인-정관': '정인(지식·지원)과 정관(규율)의 조합은 조직 내 이상적 사수-후배 구조.',
      default: `업무 관계에서 A가 B를 '${AtoB}'으로 봄. 기대 역할을 명시적으로 합의할 것.`
    },
    parent_child: {
      '정인-비견': '부모가 자녀를 독립적 존재로 인정하지 못할 때 발생하는 갈등. 자율성 존중이 관계의 핵심.',
      '편인-겁재': '편인의 통제와 겁재의 반발. 경쟁적 역학 구조. 지지가 아닌 간섭으로 느껴질 위험.',
      default: `${AtoB}·${BtoA}의 관계. 일방적 기대보다 상호 역할 인정이 관계 유지의 핵심.`
    }
  };

  const typeMap = adviceMap[relType] || adviceMap.romantic;
  const key = `${AtoB}-${BtoA}`;
  return typeMap[key] || typeMap[`${BtoA}-${AtoB}`] || typeMap.default;
}

// ── 자미두수 궁 → 처세 조언 ──────────────────────────────────────
function getZiWeiAdvice(ziWeiCompatResult, relType) {
  const advice = [];
  const factors = ziWeiCompatResult.factors || [];

  for (const f of factors) {
    if (f.factor.includes('부처궁') && relType === 'romantic') {
      advice.push({ category: '자미두수 연애', text: f.score > 0 ? '부처궁 인연 지표 긍정: 장기적 관계로 발전할 인연 구조가 존재함.' : '부처궁 흉성 영향: 배우자 운에 도전 요소 존재. 관계 진입 전 상대방의 과거 관계 패턴을 확인할 것.' });
    }
    if (f.factor.includes('관록궁') && relType === 'work') {
      advice.push({ category: '자미두수 직업', text: f.score > 0 ? '관록궁 길성: 함께 일할 때 목표 달성 가능성 높음.' : '관록궁 충돌: 성과 배분과 역할 인정 문제에서 갈등 예상.' });
    }
  }

  if (!advice.length) {
    advice.push({ category: '자미두수 관계', text: '명궁 오행 구조상 에너지 방향이 유사. 비슷한 목표와 방식으로 관계 유지 가능.' });
  }

  return advice;
}

// ── 시나스트리 → 처세 조언 ───────────────────────────────────────
function getAstrologyAdvice(synastryResult, relType) {
  const advice = [];

  // 상위 긍정 요인
  const topPositive = synastryResult.matchedFactors?.slice(0, 2) || [];
  for (const f of topPositive) {
    if (f.score >= 12) {
      advice.push({ category: '점성술 강점', text: `${f.pairKr} ${f.aspect}: ${f.desc}` });
    }
  }

  // 주요 경고 요인
  const topWarning = synastryResult.warnings?.slice(0, 2) || [];
  for (const f of topWarning) {
    if (f.score <= -6) {
      advice.push({ category: '점성술 주의', text: `${f.pairKr} ${f.aspect}: ${f.desc}` });
    }
  }

  return advice;
}

// ── 관계 유형별 최종 처세 조언 생성 ──────────────────────────────
function generateActionableAdvice(analysisResult) {
  const { relType, saju, ziWei, astrology, totalScore } = analysisResult;
  const sections = [];

  // 1. 시너지 요인 (긍정적 상호작용)
  const synergy = [];
  if (saju?.dayBranch?.score > 0) synergy.push({ src: '사주', text: `일지 관계(${saju.dayBranch.branchA}·${saju.dayBranch.branchB}): ${(saju.dayBranch.relations[0] || {}).desc || ''}` });
  if (saju?.johu?.score > 0) synergy.push({ src: '사주', text: `조후 보완: ${(saju.johu.comments || []).join(' / ')}` });
  if (astrology?.synastry?.matchedFactors?.length) {
    const f = astrology.synastry.matchedFactors[0];
    if (f?.score >= 12) synergy.push({ src: '점성술', text: f.desc });
  }
  if (ziWei?.factors?.length) {
    const f = ziWei.factors.find(x => x.score > 0);
    if (f) synergy.push({ src: '자미두수', text: f.desc });
  }

  sections.push({ title: '시너지 요인', items: synergy.slice(0, 4) });

  // 2. 주의사항 및 처세술
  const cautions = [];
  if (saju?.dayBranch?.score < -8) cautions.push({ src: '사주', text: `일지 ${saju.dayBranch.relations[0]?.type}: ${saju.dayBranch.relations[0]?.desc || ''}` });
  if (astrology?.synastry?.warnings?.length) {
    const w = astrology.synastry.warnings[0];
    if (w?.score <= -6) cautions.push({ src: '점성술', text: w.desc });
  }
  if (saju?.elementA) {
    const elemAdvice = getElementAdvice(saju.elementA, saju.elementB);
    cautions.push(...elemAdvice.map(a => ({ src: '오행', text: a.text })));
  }

  // 관계별 추가 처세
  const relAdvice = getRelationshipSpecificAdvice(relType, totalScore, saju, astrology);
  cautions.push(...relAdvice);

  sections.push({ title: '처세 및 주의사항', items: cautions.slice(0, 5) });

  return sections;
}

function getRelationshipSpecificAdvice(relType, score, saju, astrology) {
  const advice = [];

  if (relType === 'romantic') {
    if (score >= 70) {
      advice.push({ src: '종합', text: '역학적 호조건: 감정 표현을 정기적으로 갱신할 것. 좋은 관계도 방치하면 퇴색됨.' });
    } else if (score < 55) {
      advice.push({ src: '종합', text: '역학적 긴장 요소 존재: 초기 규칙(연락 빈도, 독립 공간)을 명시적으로 합의할 것.' });
      advice.push({ src: '전략', text: '갈등 발생 시 즉각 해결보다 24시간 감정 냉각 후 재논의 방식이 효과적.' });
    }
  } else if (relType === 'work') {
    advice.push({ src: '전략', text: '성과 기여도와 권한 범위를 문서로 합의. 역학적 마찰은 역할 불분명에서 심화됨.' });
    if (score < 60) {
      advice.push({ src: '주의', text: '이견 발생 시 감정 개입 없이 데이터·사실 중심으로 논의할 것. 인신 공격성 발언 금지.' });
    }
  } else if (relType === 'parent_child') {
    advice.push({ src: '전략', text: '상대의 독립성을 존중하는 것이 관계 장기화의 핵심. 통제보다 지지를 우선할 것.' });
    if (score < 55) {
      advice.push({ src: '주의', text: '기대치를 명시적으로 공유하지 않으면 오해가 누적됨. 주기적 대화 시간 확보 권장.' });
    }
  }

  return advice;
}

// ── 상대방 핵심 성향 요약 ──────────────────────────────────────────
function summarizePersonality(sajuData, astroData) {
  const traits = [];

  // 일간 성향
  const dayMasterTraits = {
    '갑': '직선적 추진력. 리더십 강. 타인의 통제 거부.',
    '을': '유연한 적응력. 협력 지향. 단 방향 전환 잦음.',
    '병': '외향적 에너지. 주목받기 원함. 단 지속성 약.',
    '정': '섬세하고 따뜻함. 관계 중심. 감정 기복 있음.',
    '무': '묵직하고 안정적. 신뢰 중시. 단 변화 적응 느림.',
    '기': '실용적이고 꼼꼼함. 분석적. 단 우유부단 경향.',
    '경': '원칙적이고 결단력 강. 독립적. 단 비타협적.',
    '신': '세련되고 미적 감각 탁월. 단 자존심 강해 양보 어려움.',
    '임': '사고가 깊고 적응적. 전략적. 단 감정 직접 표현 약.',
    '계': '통찰력 탁월. 신중함. 단 지나친 걱정과 불안 경향.'
  };

  const stemKr = sajuData?.dayMaster?.stemKr;
  if (stemKr && dayMasterTraits[stemKr]) {
    traits.push({ category: '일간 기질', text: dayMasterTraits[stemKr] });
  }

  // 태양 부호 성향
  if (astroData?.personalA?.traits?.length) {
    const sunTrait = astroData.personalA.traits.find(t => t.category === '핵심 정체성');
    if (sunTrait) traits.push({ category: '태양궁 정체성', text: sunTrait.desc });
  }

  // 달 성향 (감정 방식)
  if (astroData?.personalA?.traits?.length) {
    const moonTrait = astroData.personalA.traits.find(t => t.category === '감정 방식');
    if (moonTrait) traits.push({ category: '달자리 감정 패턴', text: moonTrait.desc });
  }

  return traits.slice(0, 3);
}

module.exports = {
  getOverallComment,
  getElementAdvice,
  getTenGodAdvice,
  getZiWeiAdvice,
  getAstrologyAdvice,
  generateActionableAdvice,
  summarizePersonality
};

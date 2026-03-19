/**
 * 궁합 분석 통합 엔진
 *
 * 관계 유형별 가중치:
 * - 남녀 관계:  점성술 시나스트리(금성/화성/달) 40%, 사주(일지합충/조후) 40%, 자미두수(부처궁) 20%
 * - 직장 관계:  사주(격국/십성) 50%, 자미두수(노복/천이궁) 30%, 점성술(수성/토성) 20%
 * - 자녀 관계:  점성술(4/5하우스/달) 40%, 자미두수(자녀궁) 30%, 사주(식상/시주) 30%
 */

const { calcSaju, analyzeDayBranchRelation, analyzeTenGodRelation, analyzeJohuCompat } = require('./sajuEngine');
const { calcZiWei, analyzeZiWeiCompat } = require('./ziWeiEngine');
const { analyzeAstrologyCompat } = require('./astroEngine');
const { gregorianToJD } = require('./astronomy');
const { analyzeMbtiCompat } = require('./mbtiEngine');
const {
  getOverallComment,
  getElementAdvice,
  getTenGodAdvice,
  getZiWeiAdvice,
  getAstrologyAdvice,
  generateActionableAdvice,
  summarizePersonality
} = require('./textMapper');

// 관계 유형 가중치 (MBTI 없을 때)
const WEIGHTS = {
  romantic:     { saju: 0.40, ziwei: 0.20, astrology: 0.40 },
  work:         { saju: 0.50, ziwei: 0.30, astrology: 0.20 },
  parent_child: { saju: 0.30, ziwei: 0.30, astrology: 0.40 },
  friend:       { saju: 0.35, ziwei: 0.30, astrology: 0.35 }
};

// MBTI 포함 가중치 (MBTI 제공 시)
const WEIGHTS_WITH_MBTI = {
  romantic:     { saju: 0.35, ziwei: 0.15, astrology: 0.35, mbti: 0.15 },
  work:         { saju: 0.40, ziwei: 0.25, astrology: 0.15, mbti: 0.20 },
  parent_child: { saju: 0.25, ziwei: 0.25, astrology: 0.30, mbti: 0.20 },
  friend:       { saju: 0.30, ziwei: 0.20, astrology: 0.25, mbti: 0.25 }
};

/**
 * 사주 궁합 점수 계산 (0~100)
 */
function calcSajuCompatScore(sajuA, sajuB, relType) {
  let score = 50; // 기본점
  const factors = [];

  // 1. 일지 합충 (가장 중요)
  const dayBranch = analyzeDayBranchRelation(sajuA, sajuB);
  score += dayBranch.score;
  factors.push({ src: '일지합충', score: dayBranch.score, data: dayBranch });

  // 2. 십성 관계
  const tenGod = analyzeTenGodRelation(sajuA, sajuB);
  const tenGodScore = (tenGod.avgCompat - 5) * 3; // 5기준 ±3점
  score += tenGodScore;
  factors.push({ src: '십성관계', score: tenGodScore, data: tenGod });

  // 3. 조후 궁합
  const johu = analyzeJohuCompat(sajuA, sajuB);
  score += johu.score;
  factors.push({ src: '조후궁합', score: johu.score, data: johu });

  // 4. 연간 합충 (부수적)
  const yearStemA = sajuA.pillars.year.stemIdx;
  const yearStemB = sajuB.pillars.year.stemIdx;
  const { STEM_COMBO, STEM_CLASH } = require('./constants/ganzhi');
  if (STEM_COMBO[yearStemA] === yearStemB) { score += 5; factors.push({ src: '연간합', score: 5 }); }
  if (STEM_CLASH[yearStemA] === yearStemB) { score -= 3; factors.push({ src: '연간충', score: -3 }); }

  // 5. 관계 유형별 특화
  if (relType === 'work') {
    // 월주 합충 (사회적 영역)
    const monthBranchA = sajuA.pillars.month.branchIdx;
    const monthBranchB = sajuB.pillars.month.branchIdx;
    const { BRANCH_SIX_COMBO_MAP, BRANCH_CLASH_MAP } = require('./constants/ganzhi');
    if (BRANCH_SIX_COMBO_MAP[monthBranchA] === monthBranchB) { score += 8; factors.push({ src: '월지합', score: 8 }); }
    if (BRANCH_CLASH_MAP[monthBranchA] === monthBranchB) { score -= 6; factors.push({ src: '월지충', score: -6 }); }
  }

  if (relType === 'parent_child' && sajuA.pillars.hour && sajuB.pillars.hour) {
    // 시주 합충 (자녀·후계 관계)
    const hourBranchA = sajuA.pillars.hour.branchIdx;
    const hourBranchB = sajuB.pillars.hour.branchIdx;
    const { BRANCH_SIX_COMBO_MAP, BRANCH_CLASH_MAP } = require('./constants/ganzhi');
    if (BRANCH_SIX_COMBO_MAP[hourBranchA] === hourBranchB) { score += 10; factors.push({ src: '시지합', score: 10 }); }
  }

  // 6. 공망 검사 (일지가 상대의 공망이면 감점)
  const kongwangA = sajuA.kongwang || [];
  const kongwangB = sajuB.kongwang || [];
  const { BRANCHES_KR } = require('./constants/ganzhi');
  const dayBranchAKr = sajuA.pillars.day.branchKr;
  const dayBranchBKr = sajuB.pillars.day.branchKr;
  if (kongwangA.includes(dayBranchBKr)) { score -= 5; factors.push({ src: 'A 공망 해당', score: -5 }); }
  if (kongwangB.includes(dayBranchAKr)) { score -= 5; factors.push({ src: 'B 공망 해당', score: -5 }); }

  return {
    score: Math.max(0, Math.min(100, score)),
    factors,
    dayBranch,
    tenGod,
    johu,
    elementA: sajuA.elementCount,
    elementB: sajuB.elementCount
  };
}

/**
 * 자미두수 궁합 점수 계산 (0~100)
 */
function calcZiWeiCompatScore(ziWeiA, ziWeiB, relType) {
  const result = analyzeZiWeiCompat(ziWeiA, ziWeiB, relType);

  // 0~40 → 0~100으로 정규화
  const normalized = 50 + (result.score / result.maxScore) * 50;

  return {
    score: Math.max(0, Math.min(100, normalized)),
    rawScore: result.score,
    factors: result.factors
  };
}

/**
 * 신뢰도 점수 계산
 * 출생 데이터의 정밀도에 따라 결정
 */
function calcReliability(birthDataA, birthDataB, sajuA, sajuB, ziWeiA, ziWeiB) {
  let base = 100;

  // 시간 불명 패널티
  if (birthDataA.hourUnknown) base -= 15;
  if (birthDataB.hourUnknown) base -= 15;

  // 출생지 미입력 패널티
  if (!birthDataA.longitude) base -= 5;
  if (!birthDataB.longitude) base -= 5;

  // 사주 시간 보정 신뢰도 반영
  base = Math.min(base, sajuA.reliability, sajuB.reliability);

  // 자미두수 신뢰도 반영 (시간 의존도 높음)
  const ziWeiRel = Math.min(ziWeiA.reliability, ziWeiB.reliability);
  base = Math.min(base, base * 0.7 + ziWeiRel * 0.3);

  return Math.round(Math.max(40, Math.min(100, base)));
}

/**
 * 신뢰도 레벨 및 설명
 */
function getReliabilityLabel(score) {
  if (score >= 90) return { level: 'HIGH', label: '높음', color: 'green', desc: '출생 시각과 위치가 정확히 입력됨. 분석 결과의 신뢰도 높음.' };
  if (score >= 75) return { level: 'MEDIUM', label: '보통', color: 'yellow', desc: '핵심 데이터는 확보됨. 일부 미세 보정 미적용. 주요 지표는 신뢰 가능.' };
  if (score >= 55) return { level: 'LOW', label: '낮음', color: 'orange', desc: '출생 시각 불명 또는 출생지 미입력. 시주(時柱)·자미두수 분석 정확도 제한.' };
  return { level: 'VERY_LOW', label: '매우 낮음', color: 'red', desc: '필수 데이터 부족. 날짜 기반 분석만 수행. 결과 참고 수준으로만 활용할 것.' };
}

/**
 * 메인 궁합 분석 함수
 * @param {object} birthDataA - { year, month, day, hour, minute, longitude, latitude, name, gender, hourUnknown, mbti }
 * @param {object} birthDataB
 * @param {string} relType - 'romantic' | 'work' | 'parent_child'
 */
async function analyzeCompatibility(birthDataA, birthDataB, relType = 'romantic') {
  const hasMbti = !!(birthDataA.mbti && birthDataB.mbti);
  const weights = (hasMbti ? WEIGHTS_WITH_MBTI[relType] : WEIGHTS[relType]) || WEIGHTS.romantic;

  // ── JD 계산 ────────────────────────────────────────────────────
  const stdHourA = (birthDataA.hour || 12) + (birthDataA.minute || 0) / 60;
  const stdHourB = (birthDataB.hour || 12) + (birthDataB.minute || 0) / 60;
  const jdA = gregorianToJD(birthDataA.year, birthDataA.month, birthDataA.day, stdHourA - 9);
  const jdB = gregorianToJD(birthDataB.year, birthDataB.month, birthDataB.day, stdHourB - 9);

  // ── 사주 계산 ──────────────────────────────────────────────────
  const sajuA = calcSaju(birthDataA);
  const sajuB = calcSaju(birthDataB);

  // ── 자미두수 계산 ──────────────────────────────────────────────
  const hourBranchIdxA = birthDataA.hourUnknown ? -1 : (sajuA.pillars.hour ? sajuA.pillars.hour.branchIdx : -1);
  const hourBranchIdxB = birthDataB.hourUnknown ? -1 : (sajuB.pillars.hour ? sajuB.pillars.hour.branchIdx : -1);
  const ziWeiA = calcZiWei(birthDataA, jdA, hourBranchIdxA);
  const ziWeiB = calcZiWei(birthDataB, jdB, hourBranchIdxB);

  // ── 서양 점성술 계산 ───────────────────────────────────────────
  const astrology = analyzeAstrologyCompat(birthDataA, birthDataB, jdA, jdB, relType);

  // ── 점수 계산 ──────────────────────────────────────────────────
  const sajuCompat  = calcSajuCompatScore(sajuA, sajuB, relType);
  const ziWeiCompat = calcZiWeiCompatScore(ziWeiA, ziWeiB, relType);
  const astroScore  = astrology.synastry.score;

  // MBTI 분석 (선택 입력)
  const mbtiResult = hasMbti
    ? analyzeMbtiCompat(birthDataA.mbti.toUpperCase(), birthDataB.mbti.toUpperCase(), relType)
    : null;
  const mbtiScore = mbtiResult ? mbtiResult.score : 0;

  // 가중 합산
  const weightedScore =
    sajuCompat.score   * weights.saju     +
    ziWeiCompat.score  * weights.ziwei    +
    astroScore         * weights.astrology +
    (hasMbti ? mbtiScore * weights.mbti : 0);

  const totalScore = Math.round(Math.max(0, Math.min(100, weightedScore)));

  // ── 신뢰도 계산 ────────────────────────────────────────────────
  const reliabilityScore = calcReliability(birthDataA, birthDataB, sajuA, sajuB, ziWeiA, ziWeiB);
  const reliabilityInfo  = getReliabilityLabel(reliabilityScore);

  // ── 텍스트 생성 ────────────────────────────────────────────────
  const overallComment  = getOverallComment(totalScore, relType);
  const tenGodAdvice    = getTenGodAdvice(sajuCompat.tenGod, relType);
  const ziWeiAdvice     = getZiWeiAdvice(ziWeiCompat, relType);
  const astroAdvice     = getAstrologyAdvice(astrology.synastry, relType);
  const personalityA    = summarizePersonality(sajuA, { personalA: astrology.personalA });
  const personalityB    = summarizePersonality(sajuB, { personalA: astrology.personalB });

  const actionableAdvice = generateActionableAdvice({
    relType,
    totalScore,
    saju: { ...sajuCompat, dayBranch: sajuCompat.dayBranch, johu: sajuCompat.johu, elementA: sajuA.elementCount, elementB: sajuB.elementCount },
    ziWei: ziWeiCompat,
    astrology
  });

  // ── 최종 결과 조립 ────────────────────────────────────────────
  return {
    // 입력 정보 요약
    persons: {
      A: { name: birthDataA.name || '인물 A', ...birthDataA },
      B: { name: birthDataB.name || '인물 B', ...birthDataB }
    },
    relType,
    relTypeKr: { romantic: '남녀 궁합', work: '직장 상하 궁합', parent_child: '부모-자녀 궁합' }[relType],

    // 점수
    scores: {
      total: totalScore,
      saju:  Math.round(sajuCompat.score),
      ziwei: Math.round(ziWeiCompat.score),
      astro: Math.round(astroScore),
      mbti:  mbtiResult ? Math.round(mbtiScore) : null,
      weights
    },

    // 종합 평가
    overall: {
      ...overallComment,
      score: totalScore
    },

    // 개인 성향 분석
    personalityA,
    personalityB,

    // 사주 데이터
    sajuA: {
      pillars: sajuA.pillars,
      dayMaster: sajuA.dayMaster,
      elementCount: sajuA.elementCount,
      elementSummary: sajuA.elementSummary,
      reliability: sajuA.reliability
    },
    sajuB: {
      pillars: sajuB.pillars,
      dayMaster: sajuB.dayMaster,
      elementCount: sajuB.elementCount,
      elementSummary: sajuB.elementSummary,
      reliability: sajuB.reliability
    },

    // 사주 궁합 분석
    sajuCompat: {
      score: sajuCompat.score,
      dayBranch: sajuCompat.dayBranch,
      tenGod: sajuCompat.tenGod,
      johu: sajuCompat.johu,
      tenGodAdvice
    },

    // 자미두수 분석
    ziWei: {
      A: { lifePalace: ziWeiA.lifePalaceBranch, bodyPalace: ziWeiA.bodyPalaceBranch, spouseStars: ziWeiA.keyPalaceStars.spouse },
      B: { lifePalace: ziWeiB.lifePalaceBranch, bodyPalace: ziWeiB.bodyPalaceBranch, spouseStars: ziWeiB.keyPalaceStars.spouse },
      compat: { score: ziWeiCompat.score, factors: ziWeiCompat.factors },
      advice: ziWeiAdvice
    },

    // 점성술 분석
    astrology: {
      chartA: astrology.chartA,
      chartB: astrology.chartB,
      personalA: astrology.personalA,
      personalB: astrology.personalB,
      synastry: {
        score: astroScore,
        topFactors: astrology.synastry.matchedFactors,
        warnings: astrology.synastry.warnings,
        sunSignCompat: astrology.synastry.sunSignCompat
      },
      advice: astroAdvice
    },

    // MBTI 분석 (입력 시에만)
    mbti: mbtiResult ? {
      typeA: birthDataA.mbti.toUpperCase(),
      typeB: birthDataB.mbti.toUpperCase(),
      score: Math.round(mbtiScore),
      knownRelation: mbtiResult.knownRelationType ? {
        name: mbtiResult.knownRelationType.type,
        desc: mbtiResult.knownRelationType.label,
        valence: mbtiResult.knownRelationType.score >= 80 ? 'positive' : mbtiResult.knownRelationType.score >= 65 ? 'neutral' : 'negative'
      } : null,
      dimensions: mbtiResult.dimensionAnalysis?.map(d => ({
        dimension: d.dim,
        valueA: d.match,
        valueB: '',
        score: d.score - 5,  // center around 0 (-5 ~ +5)
        desc: d.desc
      })),
      cognitiveFunctions: {
        stackA: mbtiResult.cognitiveCompat?.stackA?.map(s => s.func),
        stackB: mbtiResult.cognitiveCompat?.stackB?.map(s => s.func),
        isGoldenAxis: mbtiResult.cognitiveCompat?.isGoldenAxis,
        summary: mbtiResult.cognitiveCompat?.isGoldenAxis
          ? `황금쌍 축: ${birthDataA.mbti.toUpperCase()}와 ${birthDataB.mbti.toUpperCase()}의 주기능·부기능이 교차 일치`
          : `인지기능 호환 점수: ${mbtiResult.cognitiveCompat?.score}점`
      },
      advice: mbtiResult.advice?.map(a => ({ src: a.src, text: a.text })),
      profileA: mbtiResult.profileA,
      profileB: mbtiResult.profileB
    } : null,

    // 실전 처세술 (핵심 출력)
    adviceSections: actionableAdvice,

    // 신뢰도
    reliability: {
      score: reliabilityScore,
      ...reliabilityInfo
    }
  };
}

module.exports = { analyzeCompatibility, WEIGHTS };

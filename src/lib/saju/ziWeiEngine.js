/**
 * 자미두수 (紫微斗數) 계산 엔진
 *
 * 명궁(命宮) 산출, 12궁 배치, 주요 별 안치,
 * 궁합 관련 핵심궁 분석 (부처궁/자녀궁/노복궁/관록궁/천이궁)
 *
 * [참고] 정확한 자미두수는 음력 일수 + 출생 시각 기준.
 *        이 MVP는 음력 근사값 사용. 완전한 정확도는 만세력 DB 필요.
 */

const {
  BRANCHES, BRANCHES_KR, STEMS, STEMS_KR,
  BRANCH_ELEMENT, ELEMENTS_KR
} = require('./constants/ganzhi');

const { getLunarDayApprox, getLunarMonthApprox, gregorianToJD } = require('./astronomy');

// ── 12궁 정의 ─────────────────────────────────────────────────────
const TWELVE_PALACES = [
  { idx: 0, name: '命宮', kr: '명궁', desc: '본인의 성격·운명 전반' },
  { idx: 1, name: '兄弟宮', kr: '형제궁', desc: '형제·동료 관계' },
  { idx: 2, name: '夫妻宮', kr: '부처궁', desc: '배우자·연애 관계 핵심궁' },
  { idx: 3, name: '子女宮', kr: '자녀궁', desc: '자녀·창의력·후계자' },
  { idx: 4, name: '財帛宮', kr: '재백궁', desc: '재물·경제력' },
  { idx: 5, name: '疾厄宮', kr: '질액궁', desc: '건강·위기 관리' },
  { idx: 6, name: '遷移宮', kr: '천이궁', desc: '외부 환경·대인관계·이동' },
  { idx: 7, name: '僕役宮', kr: '노복궁', desc: '부하·직원·협력자 관계' },
  { idx: 8, name: '官祿宮', kr: '관록궁', desc: '직업·사회적 지위·커리어' },
  { idx: 9, name: '田宅宮', kr: '전택궁', desc: '가정환경·부동산' },
  { idx: 10, name: '福德宮', kr: '복덕궁', desc: '정신적 만족·복' },
  { idx: 11, name: '父母宮', kr: '부모궁', desc: '부모·윗사람 관계' }
];

// ── 주요 자미두수 별 ────────────────────────────────────────────────
// 14주성 + 보좌성 일부
const MAIN_STARS = {
  // 자미계 (紫微系) - 남성적 권위
  ZIWEI:    { name: '紫微', kr: '자미', element: 2, yinYang: 1, desc: '권위·리더십·자존심', score: 9 },
  TIANJI:   { name: '天機', kr: '천기', element: 0, yinYang: 0, desc: '지혜·변화·민첩', score: 8 },
  TAIYANG:  { name: '太陽', kr: '태양', element: 1, yinYang: 1, desc: '사교·명예·활동력', score: 8 },
  WUQU:     { name: '武曲', kr: '무곡', element: 3, yinYang: 1, desc: '재물·의지·독립', score: 7 },
  TIАНТONG: { name: '天同', kr: '천동', element: 4, yinYang: 0, desc: '복덕·낙관·감성', score: 8 },
  LIANZHEN: { name: '廉貞', kr: '염정', element: 1, yinYang: 0, desc: '욕망·야심·정의감', score: 6 },
  // 천부계 (天府系) - 여성적 안정
  TIANFU:   { name: '天府', kr: '천부', element: 2, yinYang: 1, desc: '안정·보수·재물창고', score: 9 },
  TAIYIN:   { name: '太陰', kr: '태음', element: 4, yinYang: 0, desc: '감성·직관·내성', score: 8 },
  TANLANG:  { name: '貪狼', kr: '탐랑', element: 0, yinYang: 1, desc: '욕구·매력·재능', score: 7 },
  JUMEN:    { name: '巨門', kr: '거문', element: 4, yinYang: 0, desc: '언변·논쟁·분석', score: 6 },
  TIANXIANG:{ name: '天相', kr: '천상', element: 4, yinYang: 1, desc: '협력·중재·성실', score: 8 },
  TIANLIANG:{ name: '天梁', kr: '천량', element: 2, yinYang: 1, desc: '수호·조언·장수', score: 8 },
  QISHA:    { name: '七殺', kr: '칠살', element: 3, yinYang: 1, desc: '독립·투쟁·변화', score: 6 },
  POJUN:    { name: '破軍', kr: '파군', element: 4, yinYang: 1, desc: '파괴·혁신·개척', score: 6 }
};

// ── 자미성 궁위 조견표 (음력 일수 기준) ──────────────────────────────
// 자미성 위치: 음력 생일(1~30) → 지지 인덱스 (子=0)
// 표준 자미두수 안성법 (기본 오행국 무시, 단순화)
// 실전에서는 국(局) 결정 → 자미성 위치 → 기타 별 배치 순서
const ZIWEI_POSITION_TABLE = {
  1:  1,  2:  2,  3:  3,  4:  2,  5:  4,
  6:  3,  7:  5,  8:  4,  9:  6,  10: 5,
  11: 4,  12: 6,  13: 7,  14: 6,  15: 5,
  16: 6,  17: 7,  18: 8,  19: 7,  20: 9,
  21: 8,  22: 7,  23: 8,  24: 9,  25: 10,
  26: 9,  27: 8,  28: 9,  29: 10, 30: 11
};

// ── 12宮 관련 주요 별 오행국별 배치 ──────────────────────────────────
// [자미계] 자미성 위치 기준 상대 위치 (기준 자미=0)
const ZIWEI_SYSTEM_OFFSETS = {
  ZIWEI: 0, TIANJI: -1, TAIYANG: -3, WUQU: -4,
  TIANTONG: -5, LIANZHEN: -8
};

// [천부계] 천부성은 자미성의 대궁 기준 배치
const TIANFU_SYSTEM_OFFSETS = {
  TIANFU: 0, TAIYIN: 2, TANLANG: 3, JUMEN: 4,
  TIANXIANG: 6, TIANLIANG: 7, QISHA: 8, POJUN: 10
};

// ── 명궁(命宮) 계산 ───────────────────────────────────────────────

/**
 * 명궁 지지 인덱스 계산
 * 안명법(安命法): 寅宮에서 正月을 起하여, 月支에서 時支를 逆算
 * 공식: (月支 - 時支 + 12) % 12
 * orrery 참조: mingGongIdx = ((monthPaletteIdx - hourIdx) % 12 + 12) % 12
 *
 * @param {number} lunarMonth - 음력 월 (1~12)
 * @param {number} hourBranchIdx - 출생 시지 인덱스 (子=0)
 * @returns {number} 명궁 지지 인덱스 (0~11)
 */
function calcLifePalace(lunarMonth, hourBranchIdx) {
  // 정월(1월)=寅(2), 2월=卯(3), ..., 12월=丑(1)
  const monthBranch = (2 + lunarMonth - 1) % 12;
  // 명궁 = 월지에서 시지를 역산 (逆算)
  return ((monthBranch - hourBranchIdx) % 12 + 12) % 12;
}

/**
 * 신궁(身宮) 계산
 * 안신법(安身法): 子宮에서 正月을 起하여, 月支에서 時支를 順算
 * 공식: (月支 + 時支) % 12
 * orrery 참조: shenGongIdx = (monthPaletteIdx + hourIdx) % 12
 *
 * @param {number} lunarMonth
 * @param {number} hourBranchIdx
 * @returns {number} 신궁 지지 인덱스
 */
function calcBodyPalace(lunarMonth, hourBranchIdx) {
  const monthBranch = (2 + lunarMonth - 1) % 12;
  return (monthBranch + hourBranchIdx) % 12;
}

// ── 12궁 배치 ─────────────────────────────────────────────────────

/**
 * 명궁 기준으로 12궁 지지 배치
 * @param {number} lifePalaceIdx - 명궁 지지 인덱스
 * @returns {Array} 12궁 배치 배열 [{palace, branchIdx, branchKr}]
 */
function arrangePalaces(lifePalaceIdx) {
  return TWELVE_PALACES.map((palace, i) => ({
    ...palace,
    branchIdx: (lifePalaceIdx + i) % 12,
    branchKr: BRANCHES_KR[(lifePalaceIdx + i) % 12]
  }));
}

// ── 주요 별 안치 ──────────────────────────────────────────────────

/**
 * 자미성 위치 기반으로 주요 별 배치
 * @param {number} ziweiPalaceIdx - 자미성이 위치한 궁 인덱스 (0~11, 명궁 기준)
 * @returns {object} 별 이름 → 궁 인덱스
 */
function placeMainStars(ziweiPalaceIdx) {
  const starPositions = {};

  // 자미계
  for (const [star, offset] of Object.entries(ZIWEI_SYSTEM_OFFSETS)) {
    starPositions[star] = ((ziweiPalaceIdx + offset) % 12 + 12) % 12;
  }

  // 천부성: 자미성의 대궁에서 배치 (자미+6)
  const tianfuPos = (ziweiPalaceIdx + 6) % 12;
  for (const [star, offset] of Object.entries(TIANFU_SYSTEM_OFFSETS)) {
    starPositions[star] = ((tianfuPos - offset) % 12 + 12) % 12;
  }

  return starPositions;
}

/**
 * 자미두수 완전 계산
 * @param {object} birthData - { year, month, day, hour, minute, longitude }
 * @param {number} jd - 출생 JD
 * @param {number} hourBranchIdx - 출생 시지 (0~11, -1=미상)
 * @returns {object} 자미두수 결과
 */
function calcZiWei(birthData, jd, hourBranchIdx) {
  const { year, month, day } = birthData;

  // 1. 음력 월일 근사 계산
  const lunarDay = getLunarDayApprox(jd);
  const lunarMonth = getLunarMonthApprox(jd, month, day);

  // 2. 시지 처리 (미상 시 정오 기준)
  const effectiveHourBranch = hourBranchIdx >= 0 ? hourBranchIdx : 6; // 미상→午時

  // 3. 명궁, 신궁 계산
  const lifePalaceIdx = calcLifePalace(lunarMonth, effectiveHourBranch);
  const bodyPalaceIdx = calcBodyPalace(lunarMonth, effectiveHourBranch);

  // 4. 12궁 배치
  const palaces = arrangePalaces(lifePalaceIdx);

  // 5. 자미성 위치 결정 (음력 일수 기준)
  const effectiveDay = Math.min(Math.max(lunarDay, 1), 30);
  const ziweiRelPos = ZIWEI_POSITION_TABLE[effectiveDay] || 0;
  const ziweiPalaceIdx = ziweiRelPos; // 명궁 기준 상대 위치

  // 6. 주요 별 배치
  const starPositions = placeMainStars(ziweiPalaceIdx);

  // 7. 핵심 궁 분석
  const keyPalaces = {
    life:     palaces[0], // 명궁
    spouse:   palaces[2], // 부처궁
    children: palaces[3], // 자녀궁
    career:   palaces[8], // 관록궁
    servants: palaces[7], // 노복궁
    travel:   palaces[6], // 천이궁
    body:     palaces[bodyPalaceIdx]
  };

  // 8. 각 핵심 궁의 주성 수집
  const palaceStars = {};
  for (const [starKey, palacePos] of Object.entries(starPositions)) {
    if (!palaceStars[palacePos]) palaceStars[palacePos] = [];
    palaceStars[palacePos].push({
      key: starKey,
      ...MAIN_STARS[starKey]
    });
  }

  // 9. 명궁 주성 분석
  const lifePalaceStars = palaceStars[0] || [];
  const spousePalaceStars = palaceStars[2] || [];
  const careerPalaceStars = palaceStars[8] || [];
  const childrenPalaceStars = palaceStars[3] || [];

  // 10. 길흉 점수 계산
  function calcPalaceScore(stars) {
    if (!stars.length) return 5; // 공궁: 중립
    return stars.reduce((sum, s) => sum + (s.score || 5), 0) / stars.length;
  }

  return {
    lunarDate: { month: lunarMonth, day: lunarDay },
    lifePalaceIdx,
    bodyPalaceIdx,
    lifePalaceBranch: BRANCHES_KR[lifePalaceIdx],
    bodyPalaceBranch: BRANCHES_KR[bodyPalaceIdx],
    palaces,
    starPositions,
    palaceStars,
    keyPalaces,
    keyPalaceStars: {
      life: lifePalaceStars,
      spouse: spousePalaceStars,
      career: careerPalaceStars,
      children: childrenPalaceStars
    },
    scores: {
      life: calcPalaceScore(lifePalaceStars),
      spouse: calcPalaceScore(spousePalaceStars),
      career: calcPalaceScore(careerPalaceStars),
      children: calcPalaceScore(childrenPalaceStars)
    },
    reliability: hourBranchIdx >= 0 ? 90 : 65 // 시간 미상 시 신뢰도 하락
  };
}

/**
 * 두 자미두수의 궁합 분석
 * @param {object} ziWeiA, ziWeiB
 * @param {string} relationshipType - 'romantic'|'work'|'parent_child'
 */
function analyzeZiWeiCompat(ziWeiA, ziWeiB, relationshipType) {
  const results = [];
  let score = 0;

  if (relationshipType === 'romantic') {
    // A의 부처궁 주성 ↔ B의 명궁 주성 비교
    const aSpouseStars = ziWeiA.keyPalaceStars.spouse;
    const bLifeStars = ziWeiB.keyPalaceStars.life;

    // 부처궁 대궁 관계 (서로의 부처궁이 상대 명궁에 해당하면 최고)
    const aSpouseInBLife = (ziWeiA.lifePalaceIdx + 2) % 12 === ziWeiB.lifePalaceIdx;
    const bSpouseInALife = (ziWeiB.lifePalaceIdx + 2) % 12 === ziWeiA.lifePalaceIdx;

    if (aSpouseInBLife && bSpouseInALife) {
      results.push({ factor: '부처궁 상호 대입', score: 25, desc: 'A의 부처궁과 B의 명궁이 일치. 최고의 연애 인연 지표.' });
      score += 25;
    } else if (aSpouseInBLife || bSpouseInALife) {
      results.push({ factor: '부처궁 단방향 대입', score: 15, desc: '한쪽의 부처궁이 상대의 명궁에 위치. 강한 인연 지표.' });
      score += 15;
    }

    // 부처궁 주성 길흉
    const spouseScoreA = ziWeiA.scores.spouse;
    const spouseScoreB = ziWeiB.scores.spouse;
    const avgSpouseScore = (spouseScoreA + spouseScoreB) / 2;
    if (avgSpouseScore >= 8) {
      results.push({ factor: '부처궁 주성 길', score: 15, desc: '두 사람의 부처궁 주성이 모두 길성. 안정적 관계 지속.' });
      score += 15;
    } else if (avgSpouseScore <= 5) {
      results.push({ factor: '부처궁 주성 흉', score: -10, desc: '부처궁에 흉성 영향. 결혼 생활에 긴장 요소.' });
      score -= 10;
    }

  } else if (relationshipType === 'work') {
    // 노복궁과 관록궁 분석
    const aCareerScore = ziWeiA.scores.career;
    const bCareerScore = ziWeiB.scores.career;

    if (aCareerScore >= 7 && bCareerScore >= 7) {
      results.push({ factor: '관록궁 상호 길', score: 20, desc: '두 사람 모두 직업운 양호. 협업 시 성과 창출 가능.' });
      score += 20;
    }

    // 천이궁 (대인관계) 분석
    const aTravelIdx = ziWeiA.lifePalaceIdx + 6;
    const bTravelIdx = ziWeiB.lifePalaceIdx + 6;
    if (aTravelIdx % 12 === ziWeiB.lifePalaceIdx || bTravelIdx % 12 === ziWeiA.lifePalaceIdx) {
      results.push({ factor: '천이궁 명궁 대입', score: 15, desc: '상대의 천이궁(대인관계)이 내 명궁. 자연스러운 업무 파트너십.' });
      score += 15;
    }

  } else if (relationshipType === 'parent_child') {
    // 자녀궁 분석
    const aChildScore = ziWeiA.scores.children;
    const bChildScore = ziWeiB.scores.children;

    if (aChildScore >= 7) {
      results.push({ factor: 'A 자녀궁 길', score: 12, desc: '부모(A)의 자녀궁 길성. 자녀와의 유대 강함.' });
      score += 12;
    }

    // 부모궁 ↔ 자녀궁 교차
    const aParentPalace = (ziWeiA.lifePalaceIdx + 11) % 12;
    const bChildPalace = (ziWeiB.lifePalaceIdx + 3) % 12;
    if (aParentPalace === ziWeiB.lifePalaceIdx) {
      results.push({ factor: '부모궁 자녀 명궁 대입', score: 20, desc: '부모의 부모궁이 자녀의 명궁과 일치. 깊은 인연.' });
      score += 20;
    }
  }

  // 공통: 명궁 오행 상생/상극
  const elemA = BRANCH_ELEMENT[ziWeiA.lifePalaceIdx];
  const elemB = BRANCH_ELEMENT[ziWeiB.lifePalaceIdx];
  const { ELEMENT_PRODUCES, ELEMENT_CONTROLS } = require('./constants/ganzhi');

  if (ELEMENT_PRODUCES[elemA] === elemB || ELEMENT_PRODUCES[elemB] === elemA) {
    results.push({ factor: '명궁 오행 상생', score: 10, desc: '명궁 오행이 서로 상생. 자연스러운 에너지 교환.' });
    score += 10;
  } else if (ELEMENT_CONTROLS[elemA] === elemB || ELEMENT_CONTROLS[elemB] === elemA) {
    results.push({ factor: '명궁 오행 상극', score: -5, desc: '명궁 오행이 상극. 서로 다른 방향성으로 갈등 소지.' });
    score -= 5;
  }

  return {
    factors: results,
    score: Math.max(-30, Math.min(40, score)),
    maxScore: 40
  };
}

module.exports = {
  calcZiWei,
  analyzeZiWeiCompat,
  TWELVE_PALACES,
  MAIN_STARS,
  calcLifePalace,
  arrangePalaces
};

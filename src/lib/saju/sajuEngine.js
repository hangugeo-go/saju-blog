/**
 * 사주 (四柱) 계산 엔진
 *
 * 진태양시 기준으로 연·월·일·시 사주(四柱)를 계산하고
 * 오행 구성, 십성, 용신, 일지합충 등 핵심 역학 정보를 반환한다.
 */

const {
  STEMS, STEMS_KR, BRANCHES, BRANCHES_KR, BRANCH_ANIMALS,
  ELEMENTS, ELEMENTS_KR,
  STEM_ELEMENT, STEM_YIN_YANG, BRANCH_ELEMENT, BRANCH_YIN_YANG,
  ELEMENT_PRODUCES, ELEMENT_CONTROLS, ELEMENT_PRODUCED_BY, ELEMENT_CONTROLLED_BY,
  STEM_COMBO, STEM_CLASH, BRANCH_SIX_COMBO_MAP, BRANCH_CLASH_MAP,
  BRANCH_THREE_HARMONY, BRANCH_PUNISHMENT, BRANCH_HARM_PAIRS,
  getTenGod, TEN_GOD_DESC,
  getGanzhi60, getMonthStemBase, getHourBranchIdx, getHourStemBase,
  NAYIN_60, JOHU_YONGSIN, getKongWang
} = require('./constants/ganzhi');

const {
  gregorianToJD,
  sunApparentLongitude,
  findSolarTermJD,
  MONTH_TERM_LONGITUDES
} = require('./astronomy');

const { correctBirthTime } = require('./timeCorrection');

// ── 일주(日柱) 기준 JD ────────────────────────────────────────────
// orrery 소스(pillars.ts) UNIT 기준: Feb 4, 1996 = 辛未日 (index 7)
// 역산 결과: 甲子日(index 0) = 2020년 1월 22일 (JD 2458870.5)
// 검증: Dec 1, 1982 → 戊午日(index 54), 2006-02-17 → 丁丑日 등
const DAY_GANZHI_REF_JD = 2458870.5; // 2020-01-22 = 甲子日
const DAY_GANZHI_REF_IDX = 0; // 甲子

/**
 * 일주 인덱스 계산 (0~59, 甲子=0)
 * @param {number} jd - 진태양시 기준 JD
 */
function getDayGanzhi60Idx(jd) {
  // 진태양 자시(子時 = 23:00) 이후를 다음날로 처리
  const dayNum = Math.floor(jd + 0.5); // noon 기준 정수화
  const diff = dayNum - Math.floor(DAY_GANZHI_REF_JD + 0.5);
  return ((diff % 60) + 60) % 60;
}

// ── 절기 기반 월주 계산 ────────────────────────────────────────────

/**
 * 해당 연도 각 절기(月의 시작)의 JD 계산
 * @param {number} year
 * @returns {Array} 12개 절기 JD 배열 (인월~축월 순서)
 */
function calcSolarTermsForYear(year) {
  const results = [];
  // 각 절기의 대략적 날짜 추정
  const approxDays = [
    gregorianToJD(year, 2, 4),   // 입춘 (315°)
    gregorianToJD(year, 3, 6),   // 경칩 (345°)
    gregorianToJD(year, 4, 5),   // 청명 (15°)
    gregorianToJD(year, 5, 6),   // 입하 (45°)
    gregorianToJD(year, 6, 6),   // 망종 (75°)
    gregorianToJD(year, 7, 7),   // 소서 (105°)
    gregorianToJD(year, 8, 7),   // 입추 (135°)
    gregorianToJD(year, 9, 8),   // 백로 (165°)
    gregorianToJD(year, 10, 8),  // 한로 (195°)
    gregorianToJD(year, 11, 7),  // 입동 (225°)
    gregorianToJD(year, 12, 7),  // 대설 (255°)
    gregorianToJD(year + 1, 1, 6), // 소한 (285°, 다음해)
  ];

  for (let i = 0; i < 12; i++) {
    const jd = findSolarTermJD(MONTH_TERM_LONGITUDES[i], approxDays[i]);
    results.push(jd);
  }
  return results;
}

/**
 * 연도 내 사주 월 인덱스 결정 (0=인월, 11=축월)
 * @param {number} jd - 출생 JD (KST → 진태양시 기준)
 * @param {number} year - 출생 연도
 * @returns {{ monthIdx: number, termJD: number }}
 */
function getSajuMonthIndex(jd, year) {
  const terms = calcSolarTermsForYear(year);
  // 전년도 소한도 포함 (1월초 출생자)
  const prevYearSohan = findSolarTermJD(285, gregorianToJD(year - 1, 1, 6));
  const allTerms = [prevYearSohan, ...terms];

  // allTerms[0]=전년소한(=전년축월), allTerms[1]=입춘(인월), ...
  // 배열 인덱스와 월 인덱스 매핑:
  // jd < terms[0](입춘) → 전년 축월(monthIdx=11)
  // jd ≥ terms[0](입춘) && < terms[1](경칩) → 인월(monthIdx=0)
  // ...

  let monthIdx = 11; // 기본: 전년 축월
  for (let i = 0; i < terms.length; i++) {
    if (jd >= terms[i]) {
      monthIdx = i;
    }
  }
  const termJD = monthIdx >= 0 ? terms[monthIdx] : prevYearSohan;
  return { monthIdx, termJD };
}

// ── 연주(年柱) 계산 ───────────────────────────────────────────────

/**
 * 연주 60갑자 인덱스 계산
 * 입춘(315°) 이전이면 전년도 적용
 */
function getYearGanzhi60Idx(year, jd) {
  // 해당 연도 입춘 JD
  const ipchunJD = findSolarTermJD(315, gregorianToJD(year, 2, 4));

  // 입춘 이전이면 전년도 기준
  const effectiveYear = jd < ipchunJD ? year - 1 : year;

  // 갑자년 기준: 1984년 = 甲子年 (index 0)
  const ref = 1984;
  let idx = (effectiveYear - ref) % 60;
  if (idx < 0) idx += 60;
  return idx;
}

// ── 월주(月柱) 계산 ───────────────────────────────────────────────

/**
 * 월주 60갑자 인덱스 계산
 * @param {number} monthIdx - 0=인월(1월), ..., 11=축월(12월)
 * @param {number} yearStemIdx - 연간 천간 인덱스
 */
function getMonthGanzhi60Idx(monthIdx, yearStemIdx) {
  // 인월(0) 천간 기준
  const baseStem = getMonthStemBase(yearStemIdx);
  const stemIdx = (baseStem + monthIdx) % 10;
  const branchIdx = (2 + monthIdx) % 12; // 인(2) 시작

  // 60갑자 인덱스 = 천간*6 + 지지*5 is wrong
  // 올바른 방법: (stemIdx*12 + branchIdx) mod 60 도 아님
  // 60갑자에서 천간 stemIdx, 지지 branchIdx를 가지는 인덱스 찾기
  // stemIdx % 2 == branchIdx % 2 (같은 음양이어야 함)
  // 인덱스 i에서 stemIdx = i%10, branchIdx = i%12
  // 따라서 i ≡ stemIdx (mod 10), i ≡ branchIdx (mod 12)
  // CRT 풀기
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) return i;
  }
  return 0;
}

// ── 시주(時柱) 계산 ───────────────────────────────────────────────

/**
 * 시주 60갑자 인덱스 계산
 * @param {number} hourBranchIdx - 0=자시, ..., 11=해시
 * @param {number} dayStemIdx - 일간 천간 인덱스
 */
function getHourGanzhi60Idx(hourBranchIdx, dayStemIdx) {
  const baseStem = getHourStemBase(dayStemIdx);
  const stemIdx = (baseStem + hourBranchIdx) % 10;
  const branchIdx = hourBranchIdx;

  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) return i;
  }
  return 0;
}

// ── 메인 사주 계산 함수 ───────────────────────────────────────────

/**
 * 사주팔자 전체 계산
 * @param {object} birthData - { year, month, day, hour, minute, longitude, latitude, hourUnknown }
 * @returns {object} 완성된 사주 데이터
 */
function calcSaju(birthData) {
  const { year, month, day, longitude = 127.0 } = birthData;

  // 1. 기본 JD 계산 (KST 표준시 기준)
  const stdHour = (birthData.hour || 12) + (birthData.minute || 0) / 60;
  const rawJD = gregorianToJD(year, month, day, stdHour - 9); // KST→UT

  // 2. 진태양시 보정
  const corrected = correctBirthTime(birthData, rawJD);
  const tstJD = gregorianToJD(year, month, day, corrected.tst - 9);

  // 3. 연주 계산
  const yearIdx = getYearGanzhi60Idx(year, tstJD);
  const yearGZ = getGanzhi60(yearIdx);

  // 4. 월주 계산
  const { monthIdx, termJD } = getSajuMonthIndex(tstJD, year);
  const monthGZIdx = getMonthGanzhi60Idx(monthIdx, yearGZ.stemIdx);
  const monthGZ = getGanzhi60(monthGZIdx);

  // 5. 일주 계산
  // 버그수정: tstJD는 UTC 기반이므로 KST 0~8시(UTC 전날)는 이전 날로 계산됨
  // +9/24(9시간)를 더해 한국 자정(KST midnight = UTC 15:00 전날)을 기준으로 보정
  const dayIdx = getDayGanzhi60Idx(tstJD + 9 / 24);
  const dayGZ = getGanzhi60(dayIdx);

  // 6. 시주 계산
  const hourBranchIdx = birthData.hourUnknown ? -1 : getHourBranchIdx(corrected.tstHour, corrected.tstMinute);
  let hourGZ = null;
  if (hourBranchIdx >= 0) {
    const hourIdx = getHourGanzhi60Idx(hourBranchIdx, dayGZ.stemIdx);
    hourGZ = getGanzhi60(hourIdx);
  }

  // 7. 오행 분포 계산
  const pillars = [yearGZ, monthGZ, dayGZ, hourGZ].filter(Boolean);
  const elementCount = [0, 0, 0, 0, 0]; // 木火土金水
  pillars.forEach(gz => {
    elementCount[STEM_ELEMENT[gz.stemIdx]]++;
    elementCount[BRANCH_ELEMENT[gz.branchIdx]]++;
  });

  // 8. 일간 기반 십성 관계 분석
  const dayElem = STEM_ELEMENT[dayGZ.stemIdx];
  const dayPolarity = STEM_YIN_YANG[dayGZ.stemIdx];

  // 9. 조후 용신 (월지 기준)
  const monthBranch = monthGZ.branchIdx;
  const johuNeeds = JOHU_YONGSIN[monthBranch] || [];
  const johuStrength = elementCount[johuNeeds[0]] + (johuNeeds[1] ? elementCount[johuNeeds[1]] : 0);

  // 10. 공망 계산
  const kongwang = getKongWang(dayIdx);

  // 11. 나음(納音)
  const nayin = {
    year: NAYIN_60[yearIdx],
    month: NAYIN_60[monthGZIdx],
    day: NAYIN_60[dayIdx],
    hour: hourGZ ? NAYIN_60[getHourGanzhi60Idx(hourBranchIdx, dayGZ.stemIdx)] : null
  };

  // 12. 신뢰도 점수 계산
  let reliability = 100;
  reliability -= corrected.reliabilityPenalty;
  if (!birthData.longitude) reliability -= 5; // 출생지 미입력

  return {
    pillars: {
      year:  { ...yearGZ,  pillarName: '연주(年柱)', nayin: nayin.year  },
      month: { ...monthGZ, pillarName: '월주(月柱)', nayin: nayin.month, solarTermJD: termJD },
      day:   { ...dayGZ,   pillarName: '일주(日柱)', nayin: nayin.day   },
      hour:  hourGZ ? { ...hourGZ, pillarName: '시주(時柱)', nayin: nayin.hour } : null
    },
    dayMaster: {
      stemIdx: dayGZ.stemIdx,
      stem: dayGZ.stem,
      stemKr: dayGZ.stemKr,
      element: ELEMENTS_KR[STEM_ELEMENT[dayGZ.stemIdx]],
      elementIdx: dayElem,
      yinYang: STEM_YIN_YANG[dayGZ.stemIdx] === 1 ? '양(陽)' : '음(陰)',
      polarity: dayPolarity
    },
    elementCount,
    elementSummary: ELEMENTS.map((e, i) => ({ element: e, elementKr: ELEMENTS_KR[i], count: elementCount[i] })),
    johu: {
      monthBranch,
      needs: johuNeeds.map(i => ELEMENTS_KR[i]),
      strength: johuStrength,
      comment: johuStrength >= 3 ? '기운이 잘 채워져 있어요 👍' : (johuStrength >= 1 ? '기운이 어느 정도 있어요' : '이 기운을 보충하면 도움이 돼요')
    },
    kongwang: kongwang.map(b => BRANCHES_KR[b]),
    timeCorrection: corrected,
    reliability: Math.max(0, reliability)
  };
}

/**
 * 두 사주의 일지 합충 관계 분석
 * @param {object} sajuA, sajuB
 * @returns {object} 합충 분석 결과
 */
function analyzeDayBranchRelation(sajuA, sajuB) {
  const branchA = sajuA.pillars.day.branchIdx;
  const branchB = sajuB.pillars.day.branchIdx;

  const relations = [];
  let score = 0;

  // 육합
  if (BRANCH_SIX_COMBO_MAP[branchA] === branchB) {
    relations.push({ type: '육합(六合)', score: 20, desc: '최고의 일지 궁합. 서로 자연스럽게 맞춰주는 관계.' });
    score += 20;
  }

  // 충
  if (BRANCH_CLASH_MAP[branchA] === branchB) {
    relations.push({ type: '일지충(日支沖)', score: -15, desc: '생활 방식과 가치관이 정반대. 자극과 갈등이 공존.' });
    score -= 15;
  }

  // 삼합 여부 (두 지지가 같은 삼합국에 속하면 반합)
  for (const group of BRANCH_THREE_HARMONY) {
    if (group.branches.includes(branchA) && group.branches.includes(branchB)) {
      relations.push({ type: '삼합반합(三合半合)', score: 12, desc: `${group.kr}: 목표와 방향이 일치하는 협력 관계.` });
      score += 12;
      break;
    }
  }

  // 형
  if (BRANCH_PUNISHMENT[branchA] === branchB) {
    relations.push({ type: '일지형(日支刑)', score: -10, desc: '서로를 구속하고 갈등을 유발. 배려 필요.' });
    score -= 10;
  }

  // 동일 지지
  if (branchA === branchB) {
    relations.push({ type: '일지 동지(同支)', score: 8, desc: '비슷한 생활 리듬과 가치관. 이해는 쉽지만 단조로울 수 있음.' });
    score += 8;
  }

  // 오행 관계
  const elemA = BRANCH_ELEMENT[branchA];
  const elemB = BRANCH_ELEMENT[branchB];
  if (ELEMENT_PRODUCES[elemA] === elemB || ELEMENT_PRODUCES[elemB] === elemA) {
    relations.push({ type: '오행 상생(相生)', score: 8, desc: '서로의 기운을 북돋우는 오행 관계.' });
    score += 8;
  } else if (ELEMENT_CONTROLS[elemA] === elemB || ELEMENT_CONTROLS[elemB] === elemA) {
    relations.push({ type: '오행 상극(相克)', score: -5, desc: '한쪽이 다른 쪽을 억제하는 관계. 극복 시 성장 가능.' });
    score -= 5;
  }

  return {
    branchA: BRANCHES_KR[branchA] + '(' + BRANCHES[branchA] + ')',
    branchB: BRANCHES_KR[branchB] + '(' + BRANCHES[branchB] + ')',
    relations,
    score: Math.max(-30, Math.min(30, score))
  };
}

/**
 * 일간 십성 관계 분석 (A의 일간 기준으로 B를 봄)
 */
function analyzeTenGodRelation(sajuA, sajuB) {
  const stemIdxA = sajuA.pillars.day.stemIdx;
  const stemIdxB = sajuB.pillars.day.stemIdx;
  const elemA = STEM_ELEMENT[stemIdxA];
  const elemB = STEM_ELEMENT[stemIdxB];
  const polA = STEM_YIN_YANG[stemIdxA];
  const polB = STEM_YIN_YANG[stemIdxB];

  const tenGodAtoB = getTenGod(elemA, elemB, polA, polB);
  const tenGodBtoA = getTenGod(elemB, elemA, polB, polA);

  const descAtoB = TEN_GOD_DESC[tenGodAtoB] || { short: '미상', compat: 5, desc: '데이터 없음' };
  const descBtoA = TEN_GOD_DESC[tenGodBtoA] || { short: '미상', compat: 5, desc: '데이터 없음' };

  return {
    AtoB: { tenGod: tenGodAtoB, ...descAtoB, label: `A가 B를 보는 시선: ${tenGodAtoB}` },
    BtoA: { tenGod: tenGodBtoA, ...descBtoA, label: `B가 A를 보는 시선: ${tenGodBtoA}` },
    avgCompat: (descAtoB.compat + descBtoA.compat) / 2
  };
}

/**
 * 조후 궁합 분석 (서로의 부족 오행을 채워주는가)
 */
function analyzeJohuCompat(sajuA, sajuB) {
  const needsA = sajuA.johu?.needs || [];
  const needsB = sajuB.johu?.needs || [];
  const elemSummaryA = sajuA.elementCount;
  const elemSummaryB = sajuB.elementCount;

  // A의 부족 오행을 B가 보유하는가
  const ELEMENTS_MAP = { '목(木)': 0, '화(火)': 1, '토(土)': 2, '금(金)': 3, '수(水)': 4 };
  let score = 0;
  const comments = [];

  for (const need of needsA) {
    const elemIdx = ELEMENTS_MAP[need];
    if (elemIdx !== undefined && elemSummaryB[elemIdx] >= 2) {
      score += 8;
      comments.push(`B의 ${need} 기운이 A의 조후 부족을 보완`);
    }
  }
  for (const need of needsB) {
    const elemIdx = ELEMENTS_MAP[need];
    if (elemIdx !== undefined && elemSummaryA[elemIdx] >= 2) {
      score += 8;
      comments.push(`A의 ${need} 기운이 B의 조후 부족을 보완`);
    }
  }

  return { score: Math.min(20, score), comments };
}

module.exports = {
  calcSaju,
  analyzeDayBranchRelation,
  analyzeTenGodRelation,
  analyzeJohuCompat,
  getDayGanzhi60Idx,
  calcSolarTermsForYear
};

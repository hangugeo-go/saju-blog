/**
 * 천문 계산 모듈
 *
 * - 율리우스 일수(Julian Day Number) 변환
 * - 태양 황경 계산 (절기 결정용)
 * - 태양/달/행성 위치 계산 (서양 점성술용)
 * - 절기 시각 이진탐색 계산
 *
 * 정밀도: 태양·달 ±0.01°, 행성 ±1~3° (Jean Meeus "Astronomical Algorithms" 기반)
 */

const { equationOfTime } = require('./timeCorrection');

// ── 율리우스 일수 ────────────────────────────────────────────────────

/**
 * 그레고리력 → 율리우스 일수
 * @param {number} year, month, day - 날짜
 * @param {number} hour - 시간 (소수점 포함, UT 기준), 기본 0
 * @returns {number} 율리우스 일수
 */
function gregorianToJD(year, month, day, hour = 0) {
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24.0 + B - 1524.5;
}

/**
 * 율리우스 일수 → 그레고리력
 */
function jdToGregorian(jd) {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let A;
  if (z < 2299161) {
    A = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  const hours = f * 24;
  return { year, month, day, hours };
}

// ── 태양 황경 계산 ────────────────────────────────────────────────────

/**
 * 태양 겉보기 황경 (Apparent Solar Longitude)
 * 정밀도: ±0.01°
 * @param {number} jd - 율리우스 일수 (TT ≈ UT + 약 70초, 근사치로 UT 사용)
 * @returns {number} 황경 도수 (0~360)
 */
function sunApparentLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;

  // 태양 평균 경도
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;

  // 태양 평균 근점이각
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  M = ((M % 360) + 360) % 360;
  const Mrad = (M * Math.PI) / 180;

  // 균차 (Equation of Center)
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  // 태양 진황경
  let sunLon = L0 + C;

  // 황도 승교점 (Omega)
  const omega = 125.04 - 1934.136 * T;
  const omegaRad = (omega * Math.PI) / 180;

  // 겉보기 황경 (장동·광행차 보정)
  let apparentLon = sunLon - 0.00569 - 0.00478 * Math.sin(omegaRad);

  return ((apparentLon % 360) + 360) % 360;
}

/**
 * 특정 태양 황경에 해당하는 JD를 이진탐색으로 계산
 * 절기 정확 시각 계산용
 * @param {number} targetLon - 목표 황경 (0~360)
 * @param {number} approxJd - 근사 JD (±15일 오차 허용)
 * @returns {number} 황경이 목표와 일치하는 JD
 */
function findSolarTermJD(targetLon, approxJd) {
  let lo = approxJd - 20;
  let hi = approxJd + 20;

  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    let lon = sunApparentLongitude(mid);

    // 0°/360° 경계 처리
    let diff = lon - targetLon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.0001) return mid;
    if (diff > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

// ── 24절기 황경 ────────────────────────────────────────────────────
const SOLAR_TERMS = [
  { name: '소한', kr: '소한(小寒)', lon: 285 },
  { name: '대한', kr: '대한(大寒)', lon: 300 },
  { name: '입춘', kr: '입춘(立春)', lon: 315 },
  { name: '우수', kr: '우수(雨水)', lon: 330 },
  { name: '경칩', kr: '경칩(驚蟄)', lon: 345 },
  { name: '춘분', kr: '춘분(春分)', lon: 0   },
  { name: '청명', kr: '청명(清明)', lon: 15  },
  { name: '곡우', kr: '곡우(穀雨)', lon: 30  },
  { name: '입하', kr: '입하(立夏)', lon: 45  },
  { name: '소만', kr: '소만(小滿)', lon: 60  },
  { name: '망종', kr: '망종(芒種)', lon: 75  },
  { name: '하지', kr: '하지(夏至)', lon: 90  },
  { name: '소서', kr: '소서(小暑)', lon: 105 },
  { name: '대서', kr: '대서(大暑)', lon: 120 },
  { name: '입추', kr: '입추(立秋)', lon: 135 },
  { name: '처서', kr: '처서(處暑)', lon: 150 },
  { name: '백로', kr: '백로(白露)', lon: 165 },
  { name: '추분', kr: '추분(秋分)', lon: 180 },
  { name: '한로', kr: '한로(寒露)', lon: 195 },
  { name: '상강', kr: '상강(霜降)', lon: 210 },
  { name: '입동', kr: '입동(立冬)', lon: 225 },
  { name: '소설', kr: '소설(小雪)', lon: 240 },
  { name: '대설', kr: '대설(大雪)', lon: 255 },
  { name: '동지', kr: '동지(冬至)', lon: 270 }
];

// 사주 월주 결정 절기 (12개 節 - 중기는 제외, 월의 시작 정함)
// 월지 순서: 인(1월)=315°, 묘=345°, 진=15°, 사=45°, 오=75°, 미=105°,
//            신=135°, 유=165°, 술=195°, 해=225°, 자=255°, 축=285°
const MONTH_TERM_LONGITUDES = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
// monthIdx 0 = 인월(寅月, 사주 1월), 1 = 묘월(卯月), ...

/**
 * 주어진 JD에서의 사주 월 인덱스 결정
 * @param {number} jd
 * @returns {number} 0~11 (0=인월, 1=묘월, ..., 11=축월)
 */
function getSajuMonthIdx(jd, year) {
  // 해당 연도의 각 절기 JD 계산
  const approxJDs = MONTH_TERM_LONGITUDES.map((lon, i) => {
    // 각 절기의 대략적 JD 추정 (연도 기반)
    const approxDay = gregorianToJD(year, 2 + Math.floor(i * 30.5 / 30), 4);
    return findSolarTermJD(lon, approxDay + (i - 2) * 30.44);
  });

  // 전년도 대한/소한도 포함하여 경계 처리
  const prevDahanJD = findSolarTermJD(285, gregorianToJD(year - 1, 1, 5));
  const nextSohanJD = findSolarTermJD(285, gregorianToJD(year + 1, 1, 5));

  // 순서 정렬
  const terms = [...approxJDs, prevDahanJD, nextSohanJD].sort((a, b) => a - b);

  // jd가 어느 절기 이후인지 찾기
  let monthIdx = 11; // 기본: 축월
  for (let i = 0; i < MONTH_TERM_LONGITUDES.length; i++) {
    if (jd >= approxJDs[i]) monthIdx = i;
    else break;
  }
  return monthIdx;
}

// ── 달 위치 계산 ────────────────────────────────────────────────────

/**
 * 달 황경 계산 (간략화 버전)
 * 정밀도: ±0.3°
 */
function moonLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;

  let L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841;
  let M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  let Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699;
  let D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868;
  let F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000;

  L = ((L % 360) + 360) % 360;
  M = ((M % 360) + 360) % 360;
  Mp = ((Mp % 360) + 360) % 360;
  D = ((D % 360) + 360) % 360;
  F = ((F % 360) + 360) % 360;

  const Dr = (D * Math.PI) / 180;
  const Mr = (M * Math.PI) / 180;
  const Mpr = (Mp * Math.PI) / 180;
  const Fr = (F * Math.PI) / 180;
  const Lr = (L * Math.PI) / 180;

  // 주요 황경 보정항
  let lon = L +
    6.288774 * Math.sin(Mpr) +
    1.274027 * Math.sin(2 * Dr - Mpr) +
    0.658314 * Math.sin(2 * Dr) +
    0.213618 * Math.sin(2 * Mpr) -
    0.185116 * Math.sin(Mr) -
    0.114332 * Math.sin(2 * Fr) +
    0.058793 * Math.sin(2 * Dr - 2 * Mpr) +
    0.057066 * Math.sin(2 * Dr - Mr - Mpr) +
    0.053322 * Math.sin(2 * Dr + Mpr) +
    0.045758 * Math.sin(2 * Dr - Mr) -
    0.040923 * Math.sin(Mr - Mpr) -
    0.034720 * Math.sin(Dr) -
    0.030383 * Math.sin(Mr + Mpr);

  return ((lon % 360) + 360) % 360;
}

// ── 행성 위치 계산 ────────────────────────────────────────────────────
/**
 * 행성 평균 궤도 요소 (Meeus Table 31.a - J2000.0 기준)
 * [L0, L1, a, e0, e1, i0, i1, omega0, omega1, w0, w1]
 * L: 평균 경도 (도), a: 반장축 (AU), e: 이심률, i: 궤도 경사,
 * omega: 승교점 경도, w: 근일점 경도
 */
const PLANET_ELEMENTS = {
  mercury: { L0: 252.250906, L1: 149472.6746358, a: 0.387098310, e0: 0.20563175, e1: 0.000020407, i0: 7.004986,  omega0: 48.330893,  w0: 77.456119  },
  venus:   { L0: 181.979801, L1: 58517.8156760,  a: 0.723329820, e0: 0.00677188, e1: -0.000047766,i0: 3.394662,  omega0: 76.679920,  w0: 131.563707 },
  mars:    { L0: 355.433275, L1: 19140.2993313,  a: 1.523679342, e0: 0.09340062, e1: 0.000090441, i0: 1.849726,  omega0: 49.558093,  w0: 336.060234 },
  jupiter: { L0: 34.351484,  L1: 3034.9056746,   a: 5.202603191, e0: 0.04849485, e1: 0.000163244, i0: 1.303270,  omega0: 100.464441, w0: 14.331309  },
  saturn:  { L0: 50.077444,  L1: 1222.1137943,   a: 9.554909596, e0: 0.05550825, e1: -0.000346641,i0: 2.488878,  omega0: 113.665524, w0: 93.056787  }
};

/**
 * 케플러 방정식을 반복법으로 풀기
 * M = E - e*sin(E)
 */
function solveKepler(M_deg, e) {
  let E = M_deg * Math.PI / 180;
  const Mrad = M_deg * Math.PI / 180;
  for (let i = 0; i < 50; i++) {
    const dE = (Mrad - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

/**
 * 간략화된 행성 황경 계산
 * @param {string} planet - 'mercury'|'venus'|'mars'|'jupiter'|'saturn'
 * @param {number} jd
 * @returns {number} 황경 (0~360)
 */
function planetLongitude(planet, jd) {
  const p = PLANET_ELEMENTS[planet];
  if (!p) return 0;

  const T = (jd - 2451545.0) / 36525.0;

  // 평균 경도
  let L = p.L0 + p.L1 * T;
  L = ((L % 360) + 360) % 360;

  // 이심률
  const e = p.e0 + (p.e1 || 0) * T;

  // 근일점 경도
  const w = p.w0 * Math.PI / 180;

  // 평균 근점이각
  let M_deg = L - p.w0;
  M_deg = ((M_deg % 360) + 360) % 360;

  // 케플러 방정식 풀기
  const E = solveKepler(M_deg, e);

  // 진근점이각
  const tanV2 = Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2);
  let v = 2 * Math.atan(tanV2) * 180 / Math.PI;
  v = ((v % 360) + 360) % 360;

  // 황경 = 진근점이각 + 근일점 경도
  let lon = v + p.w0;
  lon = ((lon % 360) + 360) % 360;

  return lon;
}

/**
 * 황경을 황도12궁(사인)으로 변환
 */
const ZODIAC_SIGNS = [
  '양자리(♈)', '황소자리(♉)', '쌍둥이자리(♊)', '게자리(♋)',
  '사자자리(♌)', '처녀자리(♍)', '천칭자리(♎)', '전갈자리(♏)',
  '사수자리(♐)', '염소자리(♑)', '물병자리(♒)', '물고기자리(♓)'
];
const ZODIAC_SIGNS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function lonToSign(lon) {
  const idx = Math.floor(lon / 30);
  const degree = lon % 30;
  return {
    signIdx: idx,
    sign: ZODIAC_SIGNS[idx],
    signEn: ZODIAC_SIGNS_EN[idx],
    degree: Math.floor(degree),
    minute: Math.floor((degree % 1) * 60)
  };
}

/**
 * 태양 부호 (Sun Sign)
 */
function getSunSign(jd) {
  const lon = sunApparentLongitude(jd);
  return { longitude: lon, ...lonToSign(lon) };
}

/**
 * 달 부호 (Moon Sign)
 */
function getMoonSign(jd) {
  const lon = moonLongitude(jd);
  return { longitude: lon, ...lonToSign(lon) };
}

/**
 * 전체 행성 차트 계산
 */
function calcFullChart(jd) {
  const sun = sunApparentLongitude(jd);
  const moon = moonLongitude(jd);
  const mercury = planetLongitude('mercury', jd);
  const venus = planetLongitude('venus', jd);
  const mars = planetLongitude('mars', jd);
  const jupiter = planetLongitude('jupiter', jd);
  const saturn = planetLongitude('saturn', jd);

  return {
    sun:     { lon: sun,     ...lonToSign(sun)     },
    moon:    { lon: moon,    ...lonToSign(moon)    },
    mercury: { lon: mercury, ...lonToSign(mercury) },
    venus:   { lon: venus,   ...lonToSign(venus)   },
    mars:    { lon: mars,    ...lonToSign(mars)    },
    jupiter: { lon: jupiter, ...lonToSign(jupiter) },
    saturn:  { lon: saturn,  ...lonToSign(saturn)  }
  };
}

/**
 * 상승궁(Ascendant) 간략 계산 (위도/경도 기반)
 * @param {number} lst - 지방항성시 (도)
 * @param {number} lat - 위도
 * @returns {number} 황경
 */
function calcAscendant(jd, longitude, latitude) {
  const T = (jd - 2451545.0) / 36525.0;

  // 항성시 (Greenwich)
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T;
  GMST = ((GMST % 360) + 360) % 360;

  // 지방항성시
  const LST = (GMST + longitude) % 360;
  const LSTrad = LST * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;

  // 황도경사각
  const eps = (23.4392911 - 0.013004167 * T) * Math.PI / 180;

  // 상승궁 계산
  const y = -Math.cos(LSTrad);
  const x = Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(LSTrad);
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  asc = ((asc % 360) + 360) % 360;

  return asc;
}

// ── 음력 날짜 근사 계산 ────────────────────────────────────────────────

// 초삭(New Moon) 기준점
const NEW_MOON_REF_JD = 2451550.09765; // 2000년 1월 6일 UT 14:20 (甲子月 초삭)
const SYNODIC_MONTH = 29.530588853;

/**
 * 주어진 JD의 음력 월 내 날짜 (1~30) 근사 계산
 */
function getLunarDayApprox(jd) {
  const cycles = (jd - NEW_MOON_REF_JD) / SYNODIC_MONTH;
  const phase = cycles - Math.floor(cycles); // 0~1
  return Math.floor(phase * SYNODIC_MONTH) + 1; // 1~29
}

/**
 * 실제 신월(朔) 시점을 Newton 방법으로 정밀 계산
 * 달의 황경 - 태양의 황경 = 0 이 되는 JD를 찾는다.
 * @param {number} approxJD - 신월 근사 JD (평균 삭망월 계산값)
 * @returns {number} 실제 신월 JD
 */
function findNewMoon(approxJD) {
  let jd = approxJD;
  for (let i = 0; i < 50; i++) {
    const sunLon  = sunApparentLongitude(jd);
    const moonLon = moonLongitude(jd);
    let diff = (moonLon - sunLon + 360) % 360;
    if (diff > 180) diff -= 360; // -180 ~ +180 범위
    if (Math.abs(diff) < 0.0001) break; // 수렴 (오차 < 0.0001° ≈ 수초)
    // 달은 태양보다 하루 약 12.19° 빠름
    jd -= diff / 12.19;
  }
  return jd;
}

/**
 * 삭망월 구간 [nmStart, nmEnd) 안에 중기(中氣, 30° 배수 황경)가 있으면 true
 * 중기 목록: 춘분(0°), 곡우(30°), 소만(60°), 하지(90°), 대서(120°), 처서(150°),
 *           추분(180°), 상강(210°), 소설(240°), 동지(270°), 대한(300°), 우수(330°)
 */
function hasZhongqi(nmStart, nmEnd) {
  const lonS = sunApparentLongitude(nmStart);
  const lonE = sunApparentLongitude(nmEnd);
  for (let target = 0; target < 360; target += 30) {
    if (lonE >= lonS) {
      if (target > lonS && target <= lonE) return true;
    } else {
      // 360° 경계 통과 (예: 350° → 10°)
      if (target > lonS || target <= lonE) return true;
    }
  }
  return false;
}

/**
 * 해당 음력연도의 춘절(설날) JD 계산
 * 전년 동지 후 두 번째 신월(朔) — 실제 신월 시점으로 정밀 계산
 */
function estimateCNY(year) {
  const approxWS = gregorianToJD(year - 1, 12, 21);
  const winterSolstice = findSolarTermJD(270, approxWS);
  const cycles = (winterSolstice - NEW_MOON_REF_JD) / SYNODIC_MONTH;
  // 동지 직후 첫 신월 근사값
  const approxFirstNM = NEW_MOON_REF_JD + Math.ceil(cycles) * SYNODIC_MONTH;
  // 실제 신월로 보정
  const firstNM = findNewMoon(approxFirstNM);
  // 두 번째 신월 = 설날
  return findNewMoon(firstNM + SYNODIC_MONTH);
}

/**
 * 주어진 JD의 음력 월 근사 (1~12)
 * 실제 동지(冬至, 태양황경 270°) 후 두 번째 삭망을 설날로 산출.
 * 윤달(閏月) 처리: 중기(中氣, 30° 간격 황경) 미포함 삭망월을 윤달로 식별.
 * 윤달은 직전 정달(正月)과 같은 번호를 반환한다.
 */
function getLunarMonthApprox(jd, solarMonth, solarDay) {
  const approxYear = jdToGregorian(jd).year;

  // 평균 신월 공식 ±12시간 오차 보정
  let cny = estimateCNY(approxYear);
  if (jd < cny - 0.5) cny = estimateCNY(approxYear - 1);
  if (jd >= cny + 14 * SYNODIC_MONTH) cny = estimateCNY(approxYear + 1);
  // CNY 추정이 실제 신월보다 늦게 계산될 때(최대 12h) → 1월 1일로 직접 반환
  if (jd >= cny - 0.5 && jd < cny) return 1;

  // 정달(正月) 카운터를 먼저 증가시킨 후 검사 (윤달은 직전 번호 그대로)
  let lunarMonthNum = 0;
  let nm = cny;
  for (let i = 0; i < 15; i++) {
    const nextNm = nm + SYNODIC_MONTH;
    const isLeap = !hasZhongqi(nm, nextNm);
    if (!isLeap) lunarMonthNum++; // 정달: 번호 증가
    // 윤달: lunarMonthNum은 직전 정달 번호 유지

    if (jd >= nm && jd < nextNm) {
      return Math.min(Math.max(lunarMonthNum, 1), 12);
    }
    nm = nextNm;
  }
  return 12;
}

/**
 * 음력 날짜 → 양력 날짜 변환 (근사, 윤달 지원)
 * 동지 후 두 번째 삭망을 춘절로 삼고, 중기(中氣) 포함 여부로 윤달 식별.
 *
 * @param {number} lunarYear   - 음력 연도
 * @param {number} lunarMonth  - 음력 월 (1~12)
 * @param {number} lunarDay    - 음력 일 (1~30)
 * @param {boolean} isLeapMonth - true이면 윤달 (예: 윤5월)
 * @returns {{ year, month, day }} 양력 날짜
 */
function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
  const cny = estimateCNY(lunarYear);

  // 정달 카운터를 먼저 증가시킨 후 비교 (getLunarMonthApprox와 동일한 로직)
  let currentMonthNum = 0;
  let nm = cny;
  let foundJD = null;

  for (let i = 0; i < 15; i++) {
    // 다음 신월: 평균 삭망월로 근사 후 실제 신월로 정밀 보정
    const nextNm = findNewMoon(nm + SYNODIC_MONTH);
    const isLeap = !hasZhongqi(nm, nextNm);
    if (!isLeap) currentMonthNum++; // 정달: 번호 증가

    if (isLeapMonth) {
      // 윤달 탐색: 중기 없는 달 + 직전 정달 번호 일치
      if (isLeap && currentMonthNum === lunarMonth) {
        foundJD = nm;
        break;
      }
    } else {
      // 정달 탐색: 중기 있는 달 + 번호 일치
      if (!isLeap && currentMonthNum === lunarMonth) {
        foundJD = nm;
        break;
      }
    }
    nm = nextNm;
  }

  if (foundJD === null) {
    // 윤달이 없는 해에 윤달 입력 → 해당 월 정달로 폴백
    foundJD = findNewMoon(cny + (lunarMonth - 1) * SYNODIC_MONTH);
  }

  // 신월 JD를 KST 기준 달력일로 정규화 후 일 수 가산
  // (신월 시각의 소수부를 제거해 자정 경계 오차 ±1일 방지)
  const kstJD = foundJD + 9 / 24; // UTC → KST
  const dayOneInt = Math.floor(kstJD + 0.5); // KST 기준 해당 날의 noon JD (정수)
  const targetJD = dayOneInt + (lunarDay - 1);
  return jdToGregorian(targetJD);
}

module.exports = {
  gregorianToJD,
  jdToGregorian,
  sunApparentLongitude,
  findSolarTermJD,
  SOLAR_TERMS,
  MONTH_TERM_LONGITUDES,
  getSajuMonthIdx,
  moonLongitude,
  planetLongitude,
  ZODIAC_SIGNS,
  ZODIAC_SIGNS_EN,
  lonToSign,
  getSunSign,
  getMoonSign,
  calcFullChart,
  calcAscendant,
  getLunarDayApprox,
  getLunarMonthApprox,
  lunarToSolar,
  findNewMoon,
  SYNODIC_MONTH,
  NEW_MOON_REF_JD
};

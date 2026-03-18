/**
 * 시간 보정 모듈
 *
 * 한국 표준시(KST) 변경 이력 및 서머타임 적용
 * 경도 기반 LMT(Local Mean Time) 보정
 * 진태양시(TST: True Solar Time) 계산
 *
 * 공식: TST = Standard Time + (Longitude - Standard Meridian) × 4min + Equation of Time
 */

/**
 * 한국 표준시 변경 이력
 * UTC 오프셋(분 단위)
 */
const KST_HISTORY = [
  // [시작 JD (근사값), 오프셋(분), 설명]
  // 일제강점기 이전: LMT 기준 (Seoul ≈ 127.0°E → UTC+8h28m)
  { fromYear: 0,    fromMonth: 1,  fromDay: 1,  offsetMin: 510,  note: 'JST/일제강점기 이전 UTC+8:30' },
  { fromYear: 1908, fromMonth: 4,  fromDay: 1,  offsetMin: 510,  note: 'UTC+8:30 공식화' },
  { fromYear: 1912, fromMonth: 1,  fromDay: 1,  offsetMin: 540,  note: '일제강점기 JST UTC+9' },
  { fromYear: 1945, fromMonth: 9,  fromDay: 8,  offsetMin: 540,  note: '광복 후 UTC+9 유지' },
  { fromYear: 1954, fromMonth: 3,  fromDay: 21, offsetMin: 510,  note: 'UTC+8:30으로 변경' },
  { fromYear: 1961, fromMonth: 8,  fromDay: 10, offsetMin: 540,  note: 'UTC+9 복귀 (현재)' }
];

/**
 * 한국 서머타임(DST) 이력
 * 적용 기간 동안 표준시에 +60분 추가
 */
const DST_HISTORY = [
  { startYear:1948, startMonth:5,  startDay:1,  endYear:1948, endMonth:9,  endDay:12 },
  { startYear:1949, startMonth:4,  startDay:3,  endYear:1949, endMonth:9,  endDay:10 },
  { startYear:1950, startMonth:4,  startDay:1,  endYear:1950, endMonth:9,  endDay:9  },
  { startYear:1951, startMonth:5,  startDay:6,  endYear:1951, endMonth:9,  endDay:8  },
  { startYear:1955, startMonth:5,  startDay:5,  endYear:1955, endMonth:9,  endDay:8  },
  { startYear:1956, startMonth:5,  startDay:20, endYear:1956, endMonth:9,  endDay:29 },
  { startYear:1957, startMonth:5,  startDay:5,  endYear:1957, endMonth:9,  endDay:22 },
  { startYear:1958, startMonth:5,  startDay:4,  endYear:1958, endMonth:9,  endDay:21 },
  { startYear:1959, startMonth:5,  startDay:3,  endYear:1959, endMonth:9,  endDay:20 },
  { startYear:1960, startMonth:5,  startDay:1,  endYear:1960, endMonth:9,  endDay:18 },
  { startYear:1987, startMonth:5,  startDay:10, endYear:1987, endMonth:10, endDay:11 },
  { startYear:1988, startMonth:5,  startDay:8,  endYear:1988, endMonth:10, endDay:9  }
];

/**
 * 날짜 비교 헬퍼
 */
function dateToNum(y, m, d) { return y * 10000 + m * 100 + d; }

/**
 * 입력된 현지 표준시(KST)를 UTC로 변환
 * @param {number} year, month, day, hour, minute
 * @returns {{ utcHour: number, utcMinute: number, offsetMin: number, dstApplied: boolean }}
 */
function kstToUtc(year, month, day, hour, minute) {
  const dateNum = dateToNum(year, month, day);

  // 표준시 오프셋 결정
  let offsetMin = 540; // 기본 UTC+9
  for (let i = KST_HISTORY.length - 1; i >= 0; i--) {
    const h = KST_HISTORY[i];
    if (dateNum >= dateToNum(h.fromYear, h.fromMonth, h.fromDay)) {
      offsetMin = h.offsetMin;
      break;
    }
  }

  // 서머타임 적용 여부
  let dstApplied = false;
  for (const dst of DST_HISTORY) {
    const start = dateToNum(dst.startYear, dst.startMonth, dst.startDay);
    const end = dateToNum(dst.endYear, dst.endMonth, dst.endDay);
    if (dateNum >= start && dateNum <= end) {
      offsetMin += 60;
      dstApplied = true;
      break;
    }
  }

  // UTC 시간 계산
  let totalMinutesLocal = hour * 60 + minute;
  let totalMinutesUtc = totalMinutesLocal - offsetMin;

  // 날짜 경계 처리 (단순화 - 일 단위 보정은 JD 계산에서 처리)
  return { offsetMin, dstApplied, utcOffsetMin: totalMinutesUtc };
}

/**
 * 경도 기반 LMT 보정
 * @param {number} stdHour - 표준시 (소수점 포함)
 * @param {number} longitude - 출생지 경도 (동경 양수)
 * @param {number} stdMeridian - 표준 경선 (KST = 135°)
 * @returns {number} LMT 시간 (소수점 포함)
 */
function applyLMT(stdHour, longitude, stdMeridian = 135) {
  // 경도 1도 = 4분 차이
  const lmtCorrectionMin = (longitude - stdMeridian) * 4;
  return stdHour + lmtCorrectionMin / 60;
}

/**
 * 균시차(Equation of Time) 계산 (분 단위)
 * @param {number} jd - 율리우스 일수
 * @returns {number} 균시차 (분)
 */
function equationOfTime(jd) {
  const T = (jd - 2451545.0) / 36525.0;

  // 황도경사각
  const epsilon0 = 23.4392911 - 0.013004167 * T - 0.000000164 * T * T + 0.000000504 * T * T * T;
  const epsilonRad = (epsilon0 * Math.PI) / 180;

  // 태양 평균 경도
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  L0 = ((L0 % 360) + 360) % 360;

  // 태양 평균 근점이각
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  M = ((M % 360) + 360) % 360;
  const Mrad = (M * Math.PI) / 180;

  // 이심률
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  const y = Math.pow(Math.tan(epsilonRad / 2), 2);
  const L0rad = (L0 * Math.PI) / 180;

  // 균시차 (라디안)
  const EoTrad =
    y * Math.sin(2 * L0rad) -
    2 * e * Math.sin(Mrad) +
    4 * e * y * Math.sin(Mrad) * Math.cos(2 * L0rad) -
    0.5 * y * y * Math.sin(4 * L0rad) -
    1.25 * e * e * Math.sin(2 * Mrad);

  // 분 단위로 변환 (라디안 → 도 → 4분/도)
  return (EoTrad * 180 / Math.PI) * 4;
}

/**
 * 진태양시(True Solar Time) 계산
 * TST = 표준시 + (경도 - 표준경선) × 4분 + 균시차
 * @param {number} stdHour - 표준시 (소수점 포함, 시간 단위)
 * @param {number} longitude - 출생지 경도
 * @param {number} jd - 율리우스 일수 (균시차 계산용)
 * @param {number} stdMeridian - 표준 경선 (기본 135°)
 * @returns {{ tst: number, lmt: number, eot: number }}
 */
function calcTrueSolarTime(stdHour, longitude, jd, stdMeridian = 135) {
  const lmt = applyLMT(stdHour, longitude, stdMeridian);
  const eot = equationOfTime(jd); // 분 단위
  const tst = lmt + eot / 60; // 시간 단위

  // 24시간 범위 내로 정규화
  const normalizedTst = ((tst % 24) + 24) % 24;

  return {
    tst: normalizedTst,
    lmt: ((lmt % 24) + 24) % 24,
    eot: eot,
    lmtCorrectionMin: (longitude - stdMeridian) * 4
  };
}

/**
 * 출생 데이터를 진태양시로 완전 보정
 * @param {object} birthData - { year, month, day, hour, minute, longitude, latitude }
 * @param {number} jd - 율리우스 일수
 * @returns {object} 보정된 시간 정보
 */
function correctBirthTime(birthData, jd) {
  const { year, month, day, hour = 12, minute = 0, longitude = 127.0 } = birthData;

  const { offsetMin, dstApplied } = kstToUtc(year, month, day, hour, minute);

  // 표준시를 소수점 시간으로 변환
  const stdHour = hour + minute / 60;

  // 표준 경선 결정 (KST 오프셋에 따라)
  const stdMeridian = offsetMin >= 540 ? 135 : 127.5;

  const solar = calcTrueSolarTime(stdHour, longitude, jd, stdMeridian);

  return {
    originalHour: hour,
    originalMinute: minute,
    stdHour,
    kstOffsetMin: offsetMin,
    dstApplied,
    longitude,
    stdMeridian,
    lmt: solar.lmt,
    lmtCorrectionMin: solar.lmtCorrectionMin,
    eot: solar.eot,
    tst: solar.tst,
    tstHour: Math.floor(solar.tst),
    tstMinute: Math.round((solar.tst % 1) * 60),
    // 신뢰도 감점 (시간 불명 시)
    reliabilityPenalty: birthData.hourUnknown ? 30 : (birthData.minuteUnknown ? 10 : 0)
  };
}

module.exports = {
  kstToUtc,
  applyLMT,
  equationOfTime,
  calcTrueSolarTime,
  correctBirthTime,
  KST_HISTORY,
  DST_HISTORY
};

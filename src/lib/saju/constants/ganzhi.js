/**
 * 干支 (천간지지) 상수 및 역학 관계 테이블
 * 사주명리학의 핵심 상수 데이터 모듈
 */

// ── 천간 (Heavenly Stems) ──────────────────────────────────────────
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const STEMS_KR = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const STEMS_EN = ['JiaWood', 'YiWood', 'BingFire', 'DingFire', 'WuEarth',
                  'JiEarth', 'GengMetal', 'XinMetal', 'RenWater', 'GuiWater'];

// ── 지지 (Earthly Branches) ────────────────────────────────────────
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const BRANCHES_KR = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const BRANCH_ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

// ── 오행 (Five Elements) ──────────────────────────────────────────
const ELEMENTS = ['木', '火', '土', '金', '水'];
const ELEMENTS_KR = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'];

// 천간 오행 배속 (index 0~9 → element index)
const STEM_ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]; // 甲乙→木, 丙丁→火, 戊己→土, 庚辛→金, 壬癸→水
const STEM_YIN_YANG = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]; // 1=陽, 0=陰 (甲陽,乙陰,...)

// 지지 오행 배속
const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]; // 子→水, 丑→土, 寅卯→木, 辰→土, 巳午→火, 未→土, 申酉→金, 戌→土, 亥→水
const BRANCH_YIN_YANG = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];

// ── 오행 상생 상극 관계 ─────────────────────────────────────────────
// 오행 인덱스: 0=木, 1=火, 2=土, 3=金, 4=水
const ELEMENT_PRODUCES = [1, 2, 3, 4, 0];  // 木→火→土→金→水→木
const ELEMENT_CONTROLS = [2, 3, 4, 0, 1];  // 木→土, 火→金, 土→水, 金→木, 水→火
const ELEMENT_PRODUCED_BY = [4, 0, 1, 2, 3];
const ELEMENT_CONTROLLED_BY = [3, 4, 0, 1, 2];

// ── 천간 합충 (Stem Combinations & Clashes) ────────────────────────
// 천간 합 (合) - 합화오행
const STEM_COMBO = {
  0: 5, 5: 0,   // 甲己합 → 土
  1: 6, 6: 1,   // 乙庚합 → 金
  2: 7, 7: 2,   // 丙辛합 → 水
  3: 8, 8: 3,   // 丁壬합 → 木
  4: 9, 9: 4    // 戊癸합 → 火
};
const STEM_COMBO_ELEMENT = [[0,5],[1,6],[2,7],[3,8],[4,9]]; // [A,B] pairs
const STEM_COMBO_ELEMENT_RESULT = [2, 3, 4, 0, 1]; // 합화 결과: 土金水木火

// 천간 충 (沖) - 대립
const STEM_CLASH = {
  0: 6, 6: 0,   // 甲庚충
  1: 7, 7: 1,   // 乙辛충
  2: 8, 8: 2,   // 丙壬충
  3: 9, 9: 3    // 丁癸충
};

// ── 지지 합충형파해 ─────────────────────────────────────────────────
// 지지 육합 (六合) [A,B] 쌍
const BRANCH_SIX_COMBO_PAIRS = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
const BRANCH_SIX_COMBO_MAP = { 0:1, 1:0, 2:11, 11:2, 3:10, 10:3, 4:9, 9:4, 5:8, 8:5, 6:7, 7:6 };
const BRANCH_SIX_COMBO_ELEMENT_RESULT = [2, 0, 1, 3, 4, 2]; // 子丑→土, 寅亥→木, 卯戌→火, 辰酉→金, 巳申→水, 午未→土

// 지지 삼합 (三合)
const BRANCH_THREE_HARMONY = [
  { branches: [8, 0, 4], element: 4, name: '水局', kr: '신자진 수국' },   // 申子辰
  { branches: [11, 3, 7], element: 0, name: '木局', kr: '해묘미 목국' },  // 亥卯未
  { branches: [2, 6, 10], element: 1, name: '火局', kr: '인오술 화국' },  // 寅午戌
  { branches: [5, 9, 1], element: 3, name: '金局', kr: '사유축 금국' }    // 巳酉丑
];

// 지지 방합 (方合)
const BRANCH_DIRECTIONAL_COMBO = [
  { branches: [2, 3, 4], element: 0, name: '東方木局', kr: '인묘진 동방목국' },
  { branches: [5, 6, 7], element: 1, name: '南方火局', kr: '사오미 남방화국' },
  { branches: [8, 9, 10], element: 3, name: '西方金局', kr: '신유술 서방금국' },
  { branches: [11, 0, 1], element: 4, name: '北方水局', kr: '해자축 북방수국' }
];

// 지지 충 (沖) - 서로 충돌
const BRANCH_CLASH_MAP = { 0:6, 6:0, 1:7, 7:1, 2:8, 8:2, 3:9, 9:3, 4:10, 10:4, 5:11, 11:5 };
const BRANCH_CLASH_PAIRS = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];

// 지지 형 (刑)
const BRANCH_PUNISHMENT = {
  2: 5, 5: 8, 8: 2,   // 寅巳申 삼형
  1: 10, 10: 7, 7: 1, // 丑戌未 삼형
  0: 0,               // 子 자형
  6: 6,               // 午 자형
  3: 3,               // 卯 자형 (무례지형)
  4: 11, 11: 4        // 辰亥 상형
};

// 지지 파 (破)
const BRANCH_BREAK_PAIRS = [[0,3],[1,10],[2,11],[4,7],[5,8],[6,9]]; // 子卯, 丑戌, 寅亥, 辰未, 巳申, 午酉

// 지지 해 (害)
const BRANCH_HARM_PAIRS = [[0,11],[1,6],[2,5],[3,4],[7,8],[9,10]]; // 子亥, 丑午, 寅巳, 卯辰, 未申, 酉戌

// ── 일지 합충 강도 점수 (궁합 계산용) ─────────────────────────────
// 양의 값: 길합, 음의 값: 흉충
const BRANCH_COMPAT_SCORE = {
  SIX_COMBO: 20,      // 육합: 최고 길합
  THREE_HARMONY: 18,  // 삼합: 매우 길합
  DIRECTIONAL: 12,    // 방합: 길합
  CLASH: -15,         // 충: 충돌 (도화살일 경우 일부 가감)
  PUNISHMENT: -12,    // 형: 갈등
  BREAK: -6,          // 파: 분리
  HARM: -8,           // 해: 해로움
  SAME: 5,            // 동일 지지: 비화
};

// ── 십성 (Ten Gods) 관계 ──────────────────────────────────────────
// dayElemIdx: 일간 오행 인덱스, targetElemIdx: 대상 오행 인덱스, samePolarity: boolean
function getTenGod(dayElemIdx, targetElemIdx, dayStemPolarity, targetStemPolarity) {
  const samePol = dayStemPolarity === targetStemPolarity;
  if (dayElemIdx === targetElemIdx) return samePol ? '비견' : '겁재';
  if (ELEMENT_PRODUCES[dayElemIdx] === targetElemIdx) return samePol ? '식신' : '상관';
  if (ELEMENT_CONTROLS[dayElemIdx] === targetElemIdx) return samePol ? '편재' : '정재';
  if (ELEMENT_CONTROLLED_BY[dayElemIdx] === targetElemIdx) return samePol ? '편관' : '정관';
  if (ELEMENT_PRODUCED_BY[dayElemIdx] === targetElemIdx) return samePol ? '편인' : '정인';
  return '미상';
}

// 십성 성향 설명 (관계 맥락에서)
const TEN_GOD_DESC = {
  '비견': { short: '동등한 경쟁자', compat: 4, desc: '에너지가 비슷해 경쟁하거나 독립적으로 행동. 협력 시 시너지, 대립 시 갈등.' },
  '겁재': { short: '강탈하는 경쟁자', compat: 2, desc: '강한 자기주장과 추진력. 자원 분쟁 가능. 사업 파트너로는 주의 필요.' },
  '식신': { short: '베푸는 표현자', compat: 8, desc: '창의적 에너지를 제공. 관계에서 여유와 즐거움 창출.' },
  '상관': { short: '날카로운 표현자', compat: 5, desc: '총명하고 표현력 강함. 비판적일 수 있으나 혁신적 아이디어 제공.' },
  '편재': { short: '자유로운 재물신', compat: 7, desc: '활동적이고 사교적. 물질적 지원을 아낌없이 제공하나 변덕스러움.' },
  '정재': { short: '안정적인 재물신', compat: 9, desc: '성실하고 신뢰할 수 있는 물질적 파트너. 안정 지향.' },
  '편관': { short: '강압적 권력자', compat: 3, desc: '강한 추진력과 카리스마. 압박감을 줄 수 있으나 목표 달성에 효과적.' },
  '정관': { short: '올바른 관리자', compat: 8, desc: '규율과 책임감. 신뢰할 수 있는 장기 관계 지향.' },
  '편인': { short: '이상주의 스승', compat: 5, desc: '독창적 사고와 직관. 실용성보다 아이디어 중심.' },
  '정인': { short: '헌신적인 보호자', compat: 9, desc: '무조건적 지원과 보호. 장기 관계에서 든든한 버팀목.' }
};

// ── 60갑자 (60 Jiazi Cycle) ────────────────────────────────────────
function getGanzhi60(index) {
  const i = ((index % 60) + 60) % 60;
  return {
    stem: STEMS[i % 10],
    stemKr: STEMS_KR[i % 10],
    branch: BRANCHES[i % 12],
    branchKr: BRANCHES_KR[i % 12],
    stemIdx: i % 10,
    branchIdx: i % 12,
    index: i,
    full: STEMS[i % 10] + BRANCHES[i % 12],
    fullKr: STEMS_KR[i % 10] + BRANCHES_KR[i % 12]
  };
}

// ── 월간 산출 공식 (연간→월간 기준간) ────────────────────────────────
// 갑/기년 → 인월 丙寅부터 시작 (인월간=丙=2)
const MONTH_STEM_BASE = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // 甲己→丙, 乙庚→戊, 丙辛→庚, 丁壬→壬, 戊癸→甲
// 연간 인덱스에 따른 인월(1월) 간의 인덱스
function getMonthStemBase(yearStemIdx) {
  return [2, 4, 6, 8, 0][yearStemIdx % 5]; // 갑(0)→丙(2), 을(1)→戊(4), 병(2)→庚(6), 정(3)→壬(8), 무(4)→甲(0), 기=갑, 경=을, ...
}

// ── 시간 지지 (Hour Branches) ─────────────────────────────────────
// 진태양시 기준 (0=자시23~01, 1=축시01~03, ...)
const HOUR_BRANCH_START = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
function getHourBranchIdx(hour, minute) {
  const h = hour + minute / 60;
  if (h >= 23 || h < 1) return 0;   // 자시
  return Math.floor((h - 1) / 2) + 1;
}

// 시간 천간 기준 (일간에 따른 자시 천간)
const HOUR_STEM_BASE = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]; // 甲己日→甲子時, 乙庚日→丙子時, ...
function getHourStemBase(dayStemIdx) {
  return [0, 2, 4, 6, 8][dayStemIdx % 5];
}

// ── 나음 (納音) 오행 ────────────────────────────────────────────────
// 60갑자 납음 (index → element name)
const NAYIN_60 = [
  '海中金','海中金','爐中火','爐中火','大林木','大林木',
  '路傍土','路傍土','劍鋒金','劍鋒金','山頭火','山頭火',
  '澗下水','澗下水','城頭土','城頭土','白鑞金','白鑞金',
  '楊柳木','楊柳木','泉中水','泉中水','屋上土','屋上土',
  '霹靂火','霹靂火','松柏木','松柏木','長流水','長流水',
  '沙中金','沙中金','山下火','山下火','平地木','平地木',
  '壁上土','壁上土','金箔金','金箔金','覆燈火','覆燈火',
  '天河水','天河水','大驛土','大驛土','釵釧金','釵釧金',
  '桑拓木','桑拓木','大溪水','大溪水','沙中土','沙中土',
  '天上火','天上火','石榴木','石榴木','大海水','大海水'
];

// ── 조후용신 (調候用神) - 계절별 필요 오행 ────────────────────────
// 월지(브랜치 인덱스) → 조후 필요 오행
const JOHU_YONGSIN = {
  0: [1, 2], // 子月(동짓달): 火土 필요
  1: [1, 0], // 丑月: 火木 필요
  2: [1, 4], // 寅月: 火水 필요 (조금 따뜻하지만 습함)
  3: [4, 2], // 卯月(봄): 水土 필요
  4: [4, 0], // 辰月: 水木 필요
  5: [4, 3], // 巳月: 水金 필요 (여름 시작)
  6: [4, 2], // 午月(한여름): 水土 필요 (가장 더움)
  7: [4, 3], // 未月: 水金 필요
  8: [1, 2], // 申月: 火土 필요 (가을 시작)
  9: [1, 0], // 酉月: 火木 필요
  10:[1, 4], // 戌月: 火水 필요
  11:[1, 0]  // 亥月(초겨울): 火木 필요
};

// ── 공망 (空亡) 계산 ────────────────────────────────────────────────
// 일간 기준 공망 지지 (甲子旬~癸亥)
function getKongWang(dayIdx60) {
  const xun = Math.floor(dayIdx60 / 10); // 0~5 (甲子旬~甲戌旬)
  const kongwangBranches = [
    [10, 11], // 甲子旬: 戌亥 공망
    [8, 9],   // 甲戌旬: 申酉 공망
    [6, 7],   // 甲申旬: 午未 공망
    [4, 5],   // 甲午旬: 辰巳 공망
    [2, 3],   // 甲辰旬: 寅卯 공망
    [0, 1]    // 甲寅旬: 子丑 공망
  ];
  return kongwangBranches[xun] || [];
}

module.exports = {
  STEMS, STEMS_KR, STEMS_EN,
  BRANCHES, BRANCHES_KR, BRANCH_ANIMALS,
  ELEMENTS, ELEMENTS_KR,
  STEM_ELEMENT, STEM_YIN_YANG,
  BRANCH_ELEMENT, BRANCH_YIN_YANG,
  ELEMENT_PRODUCES, ELEMENT_CONTROLS, ELEMENT_PRODUCED_BY, ELEMENT_CONTROLLED_BY,
  STEM_COMBO, STEM_COMBO_ELEMENT, STEM_COMBO_ELEMENT_RESULT,
  STEM_CLASH,
  BRANCH_SIX_COMBO_PAIRS, BRANCH_SIX_COMBO_MAP, BRANCH_SIX_COMBO_ELEMENT_RESULT,
  BRANCH_THREE_HARMONY, BRANCH_DIRECTIONAL_COMBO,
  BRANCH_CLASH_MAP, BRANCH_CLASH_PAIRS,
  BRANCH_PUNISHMENT, BRANCH_BREAK_PAIRS, BRANCH_HARM_PAIRS,
  BRANCH_COMPAT_SCORE,
  getTenGod, TEN_GOD_DESC,
  getGanzhi60,
  getMonthStemBase, HOUR_BRANCH_START, getHourBranchIdx, getHourStemBase,
  NAYIN_60,
  JOHU_YONGSIN,
  getKongWang
};

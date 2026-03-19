// @ts-nocheck
'use client'
import { useState } from 'react';
import ScoreGauge from './ScoreGauge';
import TrustBadge from './TrustBadge';
import MbtiCard from './MbtiCard';
import {
  SynergyCard,
  CautionCard,
  PersonalityCard,
  SajuPillarsCard,
  ScoreBreakdownCard,
  AstrologyAspectsCard,
  ZiWeiCard
} from './CompatibilityCard';

const REL_TYPE_LABELS = {
  romantic:     '남녀 궁합',
  work:         '직장 상하 궁합',
  parent_child: '부모-자녀 궁합',
  friend:       '친구 궁합',
};

// ── 일간 해석 테이블 ────────────────────────────────────────────────
const DAY_MASTER_PROFILE = {
  갑: { element: '목(木)', nickname: '갑목(甲木) — 대나무', personality: '직선적 추진력과 강한 독립심. 새로운 길을 개척하려는 성향.', strengths: '결단력, 개척정신, 정직함', weaknesses: '고집, 타협 어려움, 완고함', career: '창업자, 리더십 직군, 연구개발', relationship: '관계에서 주도권을 잡으려 함. 의식적 양보 필요.' },
  을: { element: '목(木)', nickname: '을목(乙木) — 넝쿨식물', personality: '유연한 적응력과 섬세한 관계 감각. 환경에 맞게 변화하는 생존력.', strengths: '소통 능력, 적응력, 섬세함', weaknesses: '우유부단, 방향 전환 잦음', career: '기획자, 상담사, 예술가, 교육자', relationship: '깊은 배려심. 자기 의사 명확히 표현하는 훈련 필요.' },
  병: { element: '화(火)', nickname: '병화(丙火) — 태양', personality: '외향적 활동력과 강한 명예욕. 타인에게 에너지와 활력을 주는 존재감.', strengths: '사교성, 추진력, 낙관주의', weaknesses: '충동성, 지속성 약함', career: '영업, 방송·미디어, 정치, 연예', relationship: '주목받고 인정받는 것이 중요. 파트너의 지지가 핵심.' },
  정: { element: '화(火)', nickname: '정화(丁火) — 촛불', personality: '섬세하고 따뜻한 내면. 강한 감수성으로 깊은 인간관계 형성.', strengths: '공감 능력, 헌신성, 예술적 감각', weaknesses: '감정 기복, 번아웃 위험', career: '예술가, 상담사, 교육자, 의료인', relationship: '깊은 정서적 유대 추구. 감정 소진 주의.' },
  무: { element: '토(土)', nickname: '무토(戊土) — 큰 산', personality: '묵직하고 안정적. 신뢰와 포용력으로 주변의 중심이 됨.', strengths: '인내력, 신뢰성, 포용력', weaknesses: '변화 적응 느림, 보수성', career: '관리직, 부동산, 금융, 공무원', relationship: '안정과 신뢰를 제공. 유연함을 기를 것.' },
  기: { element: '토(土)', nickname: '기토(己土) — 논밭', personality: '실용적이고 분석적. 꼼꼼하게 계획하고 성실히 실행.', strengths: '계획성, 현실감각, 성실함', weaknesses: '우유부단, 과도한 걱정', career: '행정, 분석, 회계, 의학', relationship: '실용적 사랑 표현. 감정 직접 표현 연습 효과적.' },
  경: { element: '금(金)', nickname: '경금(庚金) — 도끼', personality: '원칙적이고 결단력 강. 독립적이며 명확한 기준으로 행동.', strengths: '의지력, 정의감, 책임감', weaknesses: '비타협적, 냉정함', career: '법조인, 군·경찰, 금융, 경영', relationship: '논리적 설명이 감정적 호소보다 효과적.' },
  신: { element: '금(金)', nickname: '신금(辛金) — 보석', personality: '세련된 미적 감각과 완벽주의. 예리한 판단력으로 본질을 꿰뚫음.', strengths: '예리함, 미적 감각, 정확성', weaknesses: '강한 자존심, 양보 어려움', career: '디자인, 패션, 법조, 의학', relationship: '높은 기준. 현실적 기대치 조정 필요.' },
  임: { element: '수(水)', nickname: '임수(壬水) — 큰 강', personality: '깊은 사고력과 전략적 유연성. 큰 그림을 그리는 능력 탁월.', strengths: '통찰력, 적응성, 전략적 사고', weaknesses: '감정 표현 약함, 모호함', career: '전략기획, IT, 연구, 투자', relationship: '직접적 감정 표현 연습 필요.' },
  계: { element: '수(水)', nickname: '계수(癸水) — 이슬·빗물', personality: '통찰력 탁월하며 신중하고 관찰적. 깊은 지혜와 섬세한 감각.', strengths: '직관력, 지혜, 분석 능력', weaknesses: '지나친 걱정, 결정 지연', career: '연구, 철학, 상담, 의학', relationship: '불안감을 파트너와 솔직히 나누면 신뢰 커짐.' },
};

function SajuInterpretCard({ label, saju }) {
  if (!saju?.dayMaster?.stemKr) return null;
  const profile = DAY_MASTER_PROFILE[saju.dayMaster.stemKr];
  if (!profile) return null;
  const elemColors = { '목(木)': 'text-green-700', '화(火)': 'text-red-600', '토(土)': 'text-yellow-700', '금(金)': 'text-gray-600', '수(水)': 'text-blue-700' };
  const elemColor = elemColors[profile.element] || 'text-ink-700';
  return (
    <div className="section-card">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-ink-100 ${elemColor}`}>{profile.element}</span>
        <span className="text-sm font-semibold text-ink-800">{label} — {profile.nickname}</span>
      </div>
      <p className="text-sm text-ink-600 mb-3">{profile.personality}</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-green-50 border border-green-100 rounded p-2">
          <p className="text-xs font-semibold text-green-700 mb-0.5">강점</p>
          <p className="text-xs text-green-900">{profile.strengths}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded p-2">
          <p className="text-xs font-semibold text-red-700 mb-0.5">주의점</p>
          <p className="text-xs text-red-900">{profile.weaknesses}</p>
        </div>
      </div>
      <p className="text-xs text-ink-500"><span className="font-medium text-ink-700">적합 직군:</span> {profile.career}</p>
      <p className="text-xs text-ink-500 mt-1"><span className="font-medium text-ink-700">대인관계:</span> {profile.relationship}</p>
    </div>
  );
}

export default function ResultDisplay({ data }) {
  if (!data) return null;

  const [activeTab, setActiveTab] = useState('overview');

  const {
    persons, relType, relTypeKr, scores, overall,
    personalityA, personalityB,
    sajuA, sajuB, sajuCompat,
    ziWei, astrology, mbti, adviceSections, reliability
  } = data;

  // 처세 섹션 분리
  const synergySection = adviceSections?.find(s => s.title === '시너지 요인');
  const cautionSection = adviceSections?.find(s => s.title === '처세 및 주의사항');

  const nameA = persons?.A?.name || '인물 A';
  const nameB = persons?.B?.name || '인물 B';

  const TABS = [
    { id: 'overview', label: '종합' },
    { id: 'saju',     label: '사주 해석' },
    { id: 'ziwei',    label: '자미두수' },
    { id: 'astro',    label: '점성술' },
  ];

  return (
    <div className="space-y-6">
      {/* ── 상단 헤더 ─────────────────────────────────────────────── */}
      <div className="section-card animate-fade-up">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-ink-400 uppercase tracking-wider">{relTypeKr || REL_TYPE_LABELS[relType]}</span>
          <span className="text-xs text-ink-400">{nameA} × {nameB}</span>
        </div>
        <h2 className="text-lg font-bold text-ink-800 mb-1">
          {nameA}과(와) {nameB}의 역학 궁합 분석
        </h2>
        <p className="text-sm text-ink-500">{overall?.summary}</p>
        {(persons?.A?._lunarOriginal || persons?.B?._lunarOriginal) && (
          <div className="mt-2 text-xs text-amber-600 space-y-0.5">
            {persons?.A?._lunarOriginal && <p>· {nameA} 음력 원본: {persons.A._lunarOriginal}</p>}
            {persons?.B?._lunarOriginal && <p>· {nameB} 음력 원본: {persons.B._lunarOriginal}</p>}
          </div>
        )}
      </div>

      {/* ── 종합 점수 ─────────────────────────────────────────────── */}
      <div className="section-card animate-fade-up animate-delay-1">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreGauge score={scores?.total || 0} label="종합 궁합 점수" />
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-ink-800">{scores?.total}</span>
              <span className="text-ink-400">/</span>
              <span className="text-ink-400">100점</span>
              <span className="text-sm font-medium text-ink-600 ml-2">{overall?.label}</span>
            </div>
            <ScoreBreakdownCard scores={scores} />
          </div>
        </div>
      </div>

      {/* ── 신뢰도 지수 ───────────────────────────────────────────── */}
      <div className="animate-fade-up animate-delay-1">
        <TrustBadge reliability={reliability} />
      </div>

      {/* ── 탭 네비게이션 ─────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-ink-200 text-ink-600 hover:border-indigo-400'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── 종합 탭 ──────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* 개인 성향 분석 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up animate-delay-2">
            <PersonalityCard label={nameA} traits={personalityA || []} saju={sajuA} astro={{ chart: astrology?.chartA, ...astrology?.personalA }} />
            <PersonalityCard label={nameB} traits={personalityB || []} saju={sajuB} astro={{ chart: astrology?.chartB, ...astrology?.personalB }} />
          </div>

          {/* 시너지 / 처세 */}
          {synergySection?.items?.length > 0 && <SynergyCard items={synergySection.items} />}
          {cautionSection?.items?.length > 0 && <CautionCard items={cautionSection.items} />}

          {/* MBTI */}
          {mbti && <MbtiCard mbti={mbti} nameA={nameA} nameB={nameB} />}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── 사주 해석 탭 ─────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'saju' && (
        <>
          {/* 개인 일간 프로파일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SajuInterpretCard label={nameA} saju={sajuA} />
            <SajuInterpretCard label={nameB} saju={sajuB} />
          </div>

          {/* 사주팔자 상세 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SajuPillarsCard label={nameA} saju={sajuA} />
            <SajuPillarsCard label={nameB} saju={sajuB} />
          </div>

          {/* 일지 합충 분석 */}
          {sajuCompat && (
            <div className="section-card">
              <div className="section-title">사주 일지 합충 분석</div>
              {sajuCompat.dayBranch && (
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-ink-800">{sajuCompat.dayBranch.branchA}</span>
                    <span className="text-ink-400">×</span>
                    <span className="text-2xl font-bold text-ink-800">{sajuCompat.dayBranch.branchB}</span>
                    <span className={`ml-auto text-sm font-bold ${sajuCompat.dayBranch.score > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {sajuCompat.dayBranch.score > 0 ? '+' : ''}{sajuCompat.dayBranch.score}점
                    </span>
                  </div>
                  {sajuCompat.dayBranch.relations?.map((r, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2 rounded-lg mb-2 text-sm ${r.score > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                      <span className={`font-medium flex-shrink-0 ${r.score > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{r.type}</span>
                      <p className="text-ink-600">{r.desc}</p>
                    </div>
                  ))}
                </div>
              )}
              {sajuCompat.tenGod && (
                <div className="p-3 bg-ink-50 rounded-lg border border-ink-200 mb-3">
                  <p className="text-xs text-ink-500 mb-2">천간 십성 관계</p>
                  <div className="flex gap-4">
                    <div><span className="text-xs text-ink-400">A → B: </span><span className="text-sm font-semibold text-ink-700">{sajuCompat.tenGod.AtoB?.tenGod}</span><span className="text-xs text-ink-400 ml-1">({sajuCompat.tenGod.AtoB?.short})</span></div>
                    <div><span className="text-xs text-ink-400">B → A: </span><span className="text-sm font-semibold text-ink-700">{sajuCompat.tenGod.BtoA?.tenGod}</span><span className="text-xs text-ink-400 ml-1">({sajuCompat.tenGod.BtoA?.short})</span></div>
                  </div>
                  {sajuCompat.tenGodAdvice && <p className="text-xs text-ink-600 mt-2 border-t border-ink-200 pt-2">{sajuCompat.tenGodAdvice}</p>}
                </div>
              )}
              {sajuCompat.johu?.comments?.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-medium text-blue-700 mb-1">조후(調候) 보완 관계</p>
                  {sajuCompat.johu.comments.map((c, i) => <p key={i} className="text-xs text-blue-600">· {c}</p>)}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── 자미두수 탭 ───────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'ziwei' && (
        <ZiWeiCard ziWei={ziWei} />
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── 점성술 탭 ─────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'astro' && (
        <AstrologyAspectsCard synastry={astrology?.synastry} />
      )}

      {/* ── 면책 고지 ─────────────────────────────────────────────── */}
      <div className="bg-ink-100 rounded-lg p-4 text-xs text-ink-500 mt-4">
        <p className="font-medium mb-1">분석 한계 고지</p>
        <p>· 음력 변환은 근사값 사용 (자미두수 완전 정확도에는 만세력 DB 필요)</p>
        <p>· 행성 위치는 간략화된 VSOP87 기반으로 ±1~3° 오차 가능</p>
        <p>· 역학 분석은 통계적 경향성을 제시하며 결정론적 예언이 아님</p>
      </div>
    </div>
  );
}
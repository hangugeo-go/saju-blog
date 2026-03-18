// @ts-nocheck
'use client'
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
  parent_child: '부모-자녀 궁합'
};

export default function ResultDisplay({ data }) {
  if (!data) return null;

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

      {/* ── 개인 성향 분석 ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up animate-delay-2">
        <PersonalityCard
          label={nameA}
          traits={personalityA || []}
          saju={sajuA}
          astro={{ chart: astrology?.chartA, ...astrology?.personalA }}
        />
        <PersonalityCard
          label={nameB}
          traits={personalityB || []}
          saju={sajuB}
          astro={{ chart: astrology?.chartB, ...astrology?.personalB }}
        />
      </div>

      {/* ── 시너지 요인 / 처세 조언 ──────────────────────────────── */}
      {synergySection?.items?.length > 0 && (
        <SynergyCard items={synergySection.items} />
      )}
      {cautionSection?.items?.length > 0 && (
        <CautionCard items={cautionSection.items} />
      )}

      {/* ── 사주 팔자 상세 ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up animate-delay-3">
        <SajuPillarsCard label={nameA} saju={sajuA} />
        <SajuPillarsCard label={nameB} saju={sajuB} />
      </div>

      {/* ── 사주 궁합 분석 ────────────────────────────────────────── */}
      {sajuCompat && (
        <div className="section-card animate-fade-up animate-delay-3">
          <div className="section-title">사주 일지 합충 분석</div>

          {/* 일지 관계 */}
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
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg mb-2 text-sm ${
                  r.score > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
                }`}>
                  <span className={`font-medium flex-shrink-0 ${r.score > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {r.type}
                  </span>
                  <p className="text-ink-600">{r.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* 십성 관계 */}
          {sajuCompat.tenGod && (
            <div className="p-3 bg-ink-50 rounded-lg border border-ink-200 mb-3">
              <p className="text-xs text-ink-500 mb-2">천간 십성 관계</p>
              <div className="flex gap-4">
                <div>
                  <span className="text-xs text-ink-400">A → B: </span>
                  <span className="text-sm font-semibold text-ink-700">{sajuCompat.tenGod.AtoB?.tenGod}</span>
                  <span className="text-xs text-ink-400 ml-1">({sajuCompat.tenGod.AtoB?.short})</span>
                </div>
                <div>
                  <span className="text-xs text-ink-400">B → A: </span>
                  <span className="text-sm font-semibold text-ink-700">{sajuCompat.tenGod.BtoA?.tenGod}</span>
                  <span className="text-xs text-ink-400 ml-1">({sajuCompat.tenGod.BtoA?.short})</span>
                </div>
              </div>
              {sajuCompat.tenGodAdvice && (
                <p className="text-xs text-ink-600 mt-2 border-t border-ink-200 pt-2">{sajuCompat.tenGodAdvice}</p>
              )}
            </div>
          )}

          {/* 조후 */}
          {sajuCompat.johu?.comments?.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-medium text-blue-700 mb-1">조후(調候) 보완 관계</p>
              {sajuCompat.johu.comments.map((c, i) => (
                <p key={i} className="text-xs text-blue-600">· {c}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 점성술 시나스트리 ─────────────────────────────────────── */}
      <AstrologyAspectsCard synastry={astrology?.synastry} />

      {/* ── 자미두수 ──────────────────────────────────────────────── */}
      <ZiWeiCard ziWei={ziWei} />

      {/* ── MBTI 궁합 ─────────────────────────────────────────────── */}
      {mbti && (
        <MbtiCard mbti={mbti} nameA={nameA} nameB={nameB} />
      )}

      {/* ── 면책 고지 ─────────────────────────────────────────────── */}
      <div className="bg-ink-100 rounded-lg p-4 text-xs text-ink-500 mt-8">
        <p className="font-medium mb-1">분석 한계 고지</p>
        <p>· 음력 변환은 근사값 사용 (자미두수 완전 정확도에는 만세력 DB 필요)</p>
        <p>· 행성 위치는 간략화된 VSOP87 기반으로 ±1~3° 오차 가능</p>
        <p>· 역학 분석은 통계적 경향성을 제시하며 결정론적 예언이 아님</p>
      </div>
    </div>
  );
}
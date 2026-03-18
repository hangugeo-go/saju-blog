// @ts-nocheck
'use client'
/**
 * 개별 분석 카드 컴포넌트
 * - 시너지 요인 / 주의사항 / 점성술 어스펙트 등 표시
 */

export function SynergyCard({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="section-card animate-fade-up animate-delay-2">
      <div className="section-title">시너지 요인</div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-shrink-0 w-1.5 h-full min-h-[2rem] bg-emerald-400 rounded-full" />
            <div>
              <span className="badge-positive mr-2">{item.src}</span>
              <p className="text-sm text-ink-700 mt-1">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CautionCard({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="section-card animate-fade-up animate-delay-3">
      <div className="section-title">처세 및 주의사항</div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-shrink-0 w-1.5 min-h-[2rem] bg-amber-400 rounded-full" />
            <div>
              <span className="badge-neutral mr-2">{item.src}</span>
              <p className="text-sm text-ink-700 mt-1">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PersonalityCard({ label, traits = [], saju, astro }) {
  return (
    <div className="section-card">
      <div className="section-title">{label} 핵심 성향</div>

      {/* 사주 일주 */}
      {saju?.dayMaster && (
        <div className="mb-4 p-3 bg-ink-50 rounded-lg border border-ink-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-ink-800">
              {saju.pillars.day.full}
            </span>
            <span className="text-xs text-ink-500 bg-white px-2 py-0.5 rounded border border-ink-200">
              {saju.dayMaster.element} {saju.dayMaster.yinYang}
            </span>
          </div>
          <p className="text-xs text-ink-500">{saju.pillars.day.nayin}</p>
        </div>
      )}

      {/* 태양·달 부호 */}
      {astro?.chart && (
        <div className="flex gap-2 mb-4">
          <div className="flex-1 p-2 bg-ink-50 rounded-lg border border-ink-200 text-center">
            <p className="text-xs text-ink-400">태양(☉)</p>
            <p className="text-sm font-semibold text-ink-700">{astro.chart.sun?.sign}</p>
          </div>
          <div className="flex-1 p-2 bg-ink-50 rounded-lg border border-ink-200 text-center">
            <p className="text-xs text-ink-400">달(☽)</p>
            <p className="text-sm font-semibold text-ink-700">{astro.chart.moon?.sign}</p>
          </div>
          <div className="flex-1 p-2 bg-ink-50 rounded-lg border border-ink-200 text-center">
            <p className="text-xs text-ink-400">금성(♀)</p>
            <p className="text-sm font-semibold text-ink-700">{astro.chart.venus?.sign}</p>
          </div>
        </div>
      )}

      {/* 특성 목록 */}
      <div className="space-y-2">
        {traits.map((t, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-xs text-ink-400 w-20 flex-shrink-0 pt-0.5">{t.category}</span>
            <p className="text-sm text-ink-700 flex-1">{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SajuPillarsCard({ label, saju }) {
  if (!saju) return null;
  const pillars = [
    { key: 'year',  label: '연(年)' },
    { key: 'month', label: '월(月)' },
    { key: 'day',   label: '일(日)' },
    { key: 'hour',  label: '시(時)' }
  ];

  const ELEM_COLORS = {
    '목(木)': 'text-emerald-700 bg-emerald-50 border-emerald-200',
    '화(火)': 'text-red-700 bg-red-50 border-red-200',
    '토(土)': 'text-yellow-700 bg-yellow-50 border-yellow-200',
    '금(金)': 'text-slate-700 bg-slate-50 border-slate-200',
    '수(水)': 'text-blue-700 bg-blue-50 border-blue-200'
  };

  return (
    <div className="section-card">
      <div className="section-title">{label} 사주팔자</div>
      <div className="grid grid-cols-4 gap-2">
        {pillars.map(({ key, label: pLabel }) => {
          const p = saju.pillars[key];
          if (!p) return (
            <div key={key} className="pillar-cell opacity-40">
              <span className="text-xs text-ink-400">{pLabel}</span>
              <span className="text-lg font-bold text-ink-300">?</span>
              <span className="text-xs text-ink-300">미상</span>
            </div>
          );
          const { ELEMENTS_KR } = {}; // 프론트에서 직접 계산
          const elemIdx = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(p.stem);
          const elemNames = ['목(木)','목(木)','화(火)','화(火)','토(土)','토(土)','금(金)','금(金)','수(水)','수(水)'];
          const elemName = elemNames[elemIdx] || '';
          const colorClass = ELEM_COLORS[elemName] || 'text-ink-700 bg-ink-50 border-ink-200';

          return (
            <div key={key} className="pillar-cell">
              <span className="text-xs text-ink-400 mb-1">{pLabel}</span>
              <span className={`text-xl font-bold border rounded px-1.5 py-0.5 ${colorClass}`}>{p.stem}</span>
              <span className={`text-xl font-bold border rounded px-1.5 py-0.5 mt-1 ${colorClass}`}>{p.branch}</span>
              <span className="text-xs text-ink-400 mt-1">{p.stemKr}{p.branchKr}</span>
            </div>
          );
        })}
      </div>

      {/* 오행 분포 */}
      <div className="mt-4">
        <p className="text-xs text-ink-400 mb-2">오행 분포</p>
        <div className="flex gap-1.5 flex-wrap">
          {saju.elementSummary?.map(e => (
            <div key={e.element}
              className={`px-2 py-1 rounded border text-xs font-medium ${
                e.count >= 3 ? 'bg-ink-800 text-white border-ink-800' :
                e.count === 0 ? 'bg-white text-ink-300 border-ink-200' :
                'bg-white text-ink-600 border-ink-300'
              }`}
            >
              {e.elementKr} {e.count > 0 ? e.count : '없음'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScoreBreakdownCard({ scores }) {
  const bars = [
    { label: '사주', score: scores.saju,  weight: scores.weights?.saju || 0.4, color: 'bg-amber-500' },
    { label: '자미두수', score: scores.ziwei, weight: scores.weights?.ziwei || 0.2, color: 'bg-purple-500' },
    { label: '점성술', score: scores.astro,  weight: scores.weights?.astrology || 0.4, color: 'bg-blue-500' },
    ...(scores.mbti !== null && scores.mbti !== undefined
      ? [{ label: 'MBTI', score: scores.mbti, weight: scores.weights?.mbti || 0, color: 'bg-emerald-500' }]
      : [])
  ];

  return (
    <div className="section-card">
      <div className="section-title">시스템별 점수</div>
      <div className="space-y-3">
        {bars.map(b => (
          <div key={b.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink-700">{b.label}</span>
                <span className="text-xs text-ink-400">가중치 {Math.round(b.weight * 100)}%</span>
              </div>
              <span className="text-sm font-bold text-ink-800">{Math.round(b.score)}</span>
            </div>
            <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${b.color} rounded-full transition-all duration-1000`}
                style={{ width: `${b.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AstrologyAspectsCard({ synastry }) {
  if (!synastry) return null;
  const factors = synastry.topFactors || [];
  const warnings = synastry.warnings || [];

  return (
    <div className="section-card">
      <div className="section-title">시나스트리 주요 어스펙트</div>

      {synastry.sunSignCompat && (
        <div className="mb-4 p-3 bg-ink-50 rounded-lg border border-ink-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-ink-600">태양 부호 호환성</span>
            <span className="badge-neutral">+{synastry.sunSignCompat.score}</span>
          </div>
          <p className="text-xs text-ink-600">
            {synastry.sunSignCompat.signA} × {synastry.sunSignCompat.signB}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">{synastry.sunSignCompat.desc}</p>
        </div>
      )}

      {factors.length > 0 && (
        <div className="space-y-2 mb-3">
          <p className="text-xs font-medium text-emerald-700">긍정 어스펙트</p>
          {factors.slice(0, 3).map((f, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="badge-positive">{f.aspect}</span>
              <div>
                <p className="text-xs font-medium text-ink-700">{f.pairKr}</p>
                <p className="text-xs text-ink-500">{f.desc}</p>
              </div>
              <span className="ml-auto text-xs font-bold text-emerald-600">+{f.score}</span>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-red-700">주의 어스펙트</p>
          {warnings.slice(0, 2).map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
              <span className="badge-negative">{w.aspect}</span>
              <div>
                <p className="text-xs font-medium text-ink-700">{w.pairKr}</p>
                <p className="text-xs text-ink-500">{w.desc}</p>
              </div>
              <span className="ml-auto text-xs font-bold text-red-600">{w.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ZiWeiCard({ ziWei }) {
  if (!ziWei) return null;
  return (
    <div className="section-card">
      <div className="section-title">자미두수 명궁 분석</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-ink-50 rounded-lg border border-ink-200">
          <p className="text-xs text-ink-400 mb-1">A 명궁(命宮)</p>
          <p className="text-base font-bold text-ink-800">{ziWei.A?.lifePalace || '?'}</p>
          {ziWei.A?.spouseStars?.length > 0 && (
            <p className="text-xs text-ink-500 mt-1">
              부처궁: {ziWei.A.spouseStars.map(s => s.kr).join('·')}
            </p>
          )}
        </div>
        <div className="p-3 bg-ink-50 rounded-lg border border-ink-200">
          <p className="text-xs text-ink-400 mb-1">B 명궁(命宮)</p>
          <p className="text-base font-bold text-ink-800">{ziWei.B?.lifePalace || '?'}</p>
          {ziWei.B?.spouseStars?.length > 0 && (
            <p className="text-xs text-ink-500 mt-1">
              부처궁: {ziWei.B.spouseStars.map(s => s.kr).join('·')}
            </p>
          )}
        </div>
      </div>

      {ziWei.compat?.factors?.length > 0 && (
        <div className="space-y-2">
          {ziWei.compat.factors.map((f, i) => (
            <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border text-xs ${
              f.score > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
            }`}>
              <span className={f.score > 0 ? 'badge-positive' : 'badge-negative'}>
                {f.score > 0 ? '+' : ''}{f.score}
              </span>
              <div>
                <p className="font-medium text-ink-700">{f.factor}</p>
                <p className="text-ink-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
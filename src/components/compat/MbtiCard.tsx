// @ts-nocheck
'use client'
/**
 * MBTI 궁합 분석 결과 카드
 */

const MBTI_GROUP_COLOR = {
  'NT분석가': 'bg-violet-50 border-violet-200 text-violet-700',
  'NF외교관': 'bg-emerald-50 border-emerald-200 text-emerald-700',
  'SJ관리자': 'bg-blue-50 border-blue-200 text-blue-700',
  'SP탐험가': 'bg-amber-50 border-amber-200 text-amber-700'
};

const MBTI_GROUP = {
  INTJ:'NT분석가', INTP:'NT분석가', ENTJ:'NT분석가', ENTP:'NT분석가',
  INFJ:'NF외교관', INFP:'NF외교관', ENFJ:'NF외교관', ENFP:'NF외교관',
  ISTJ:'SJ관리자', ISFJ:'SJ관리자', ESTJ:'SJ관리자', ESFJ:'SJ관리자',
  ISTP:'SP탐험가', ISFP:'SP탐험가', ESTP:'SP탐험가', ESFP:'SP탐험가'
};

function ScoreBar({ score, color = 'bg-ink-700' }) {
  return (
    <div className="w-full bg-ink-100 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all ${color}`}
        style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
      />
    </div>
  );
}

function DimensionRow({ dim }) {
  const match = dim.valueA || dim.match || '';
  const isGood = match === '동일' || match === '보완';
  return (
    <div className="py-2 border-b border-ink-100 last:border-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-14 text-xs font-semibold text-ink-600">{dim.dimension}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
          match === '동일' ? 'bg-blue-100 text-blue-700' :
          match === '보완' ? 'bg-emerald-100 text-emerald-700' :
          'bg-amber-100 text-amber-700'
        }`}>{match}</span>
      </div>
      {dim.desc && <p className="text-xs text-ink-500 leading-relaxed pl-16">{dim.desc}</p>}
    </div>
  );
}

export default function MbtiCard({ mbti, nameA, nameB }) {
  if (!mbti) return null;

  const { typeA, typeB, score, knownRelation, dimensions, cognitiveFunctions, advice } = mbti;
  const groupA = MBTI_GROUP[typeA];
  const groupB = MBTI_GROUP[typeB];
  const groupColorA = MBTI_GROUP_COLOR[groupA] || 'bg-ink-50 border-ink-200 text-ink-700';
  const groupColorB = MBTI_GROUP_COLOR[groupB] || 'bg-ink-50 border-ink-200 text-ink-700';

  return (
    <div className="section-card animate-fade-up">
      <div className="section-title">MBTI 성격 유형 궁합</div>

      {/* 유형 배지 */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="text-center">
          <div className={`inline-block px-4 py-2 rounded-xl border font-bold text-xl ${groupColorA}`}>
            {typeA}
          </div>
          <p className="text-xs text-ink-400 mt-1">{nameA || '인물 A'}</p>
          <p className="text-xs text-ink-500">{groupA}</p>
        </div>
        <div className="text-center">
          <div className="text-2xl text-ink-300">×</div>
          {score !== undefined && (
            <div className="text-lg font-bold text-ink-700">{score}점</div>
          )}
        </div>
        <div className="text-center">
          <div className={`inline-block px-4 py-2 rounded-xl border font-bold text-xl ${groupColorB}`}>
            {typeB}
          </div>
          <p className="text-xs text-ink-400 mt-1">{nameB || '인물 B'}</p>
          <p className="text-xs text-ink-500">{groupB}</p>
        </div>
      </div>

      {/* 알려진 관계 유형 */}
      {knownRelation && knownRelation.name && (
        <div className={`p-3 rounded-xl border mb-4 ${
          knownRelation.valence === 'positive' ? 'bg-emerald-50 border-emerald-200' :
          knownRelation.valence === 'negative' ? 'bg-red-50 border-red-100' :
          'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {knownRelation.valence === 'positive' ? '✦' : knownRelation.valence === 'negative' ? '△' : '◈'}
            </span>
            <div>
              <p className={`text-sm font-semibold ${
                knownRelation.valence === 'positive' ? 'text-emerald-700' :
                knownRelation.valence === 'negative' ? 'text-red-700' : 'text-blue-700'
              }`}>{knownRelation.name}</p>
              {knownRelation.desc && (
                <p className="text-xs text-ink-600 mt-0.5">{knownRelation.desc}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4가지 차원 분석 */}
      {dimensions?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">4차원 분석</p>
          <div className="bg-ink-50 rounded-xl border border-ink-200 p-3">
            {dimensions.map((dim, i) => (
              <DimensionRow key={i} dim={dim} />
            ))}
          </div>
        </div>
      )}

      {/* 인지기능 스택 호환성 */}
      {cognitiveFunctions && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">인지기능 스택</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-ink-50 rounded-lg border border-ink-200 p-3 text-center">
              <p className="text-xs text-ink-400 mb-1">{nameA || 'A'} ({typeA})</p>
              <p className="text-sm font-mono font-semibold text-ink-700">
                {Array.isArray(cognitiveFunctions.stackA)
                  ? cognitiveFunctions.stackA.join(' → ')
                  : cognitiveFunctions.stackA}
              </p>
            </div>
            <div className="bg-ink-50 rounded-lg border border-ink-200 p-3 text-center">
              <p className="text-xs text-ink-400 mb-1">{nameB || 'B'} ({typeB})</p>
              <p className="text-sm font-mono font-semibold text-ink-700">
                {Array.isArray(cognitiveFunctions.stackB)
                  ? cognitiveFunctions.stackB.join(' → ')
                  : cognitiveFunctions.stackB}
              </p>
            </div>
          </div>
          {cognitiveFunctions.isGoldenAxis && (
            <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700 font-medium">
              ✦ 황금쌍 — 주기능·부기능 교차 일치
            </div>
          )}
          {cognitiveFunctions.summary && !cognitiveFunctions.isGoldenAxis && (
            <p className="text-xs text-ink-500 mt-2 px-1">{cognitiveFunctions.summary}</p>
          )}
        </div>
      )}

      {/* 관계 유형별 어드바이스 */}
      {advice?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">관계 처세 조언</p>
          {advice.map((a, i) => (
            <div key={i} className={`p-3 rounded-lg border ${
              i === 0 ? 'bg-blue-50 border-blue-100' :
              i === 1 ? 'bg-amber-50 border-amber-100' :
              'bg-emerald-50 border-emerald-100'
            }`}>
              <p className={`text-xs font-semibold mb-1 ${
                i === 0 ? 'text-blue-700' : i === 1 ? 'text-amber-700' : 'text-emerald-700'
              }`}>{a.src}</p>
              <p className={`text-xs ${
                i === 0 ? 'text-blue-600' : i === 1 ? 'text-amber-600' : 'text-emerald-600'
              }`}>{a.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
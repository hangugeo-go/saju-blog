// @ts-nocheck
'use client'
/**
 * 신뢰도 지수 표시 컴포넌트
 */
export default function TrustBadge({ reliability }) {
  if (!reliability) return null;
  const { score, level, label, color, desc } = reliability;

  const colorMap = {
    green:  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500' },
    yellow: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   bar: 'bg-amber-500' },
    orange: { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  bar: 'bg-orange-500' },
    red:    { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     bar: 'bg-red-500' }
  };

  const c = colorMap[color] || colorMap.yellow;

  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-700">신뢰도 지수</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.bg} ${c.text} border ${c.border}`}>
            {label} ({score}점)
          </span>
        </div>
        <span className={`text-2xl font-bold ${c.text}`}>{score}</span>
      </div>

      {/* 진행 바 */}
      <div className="h-1.5 bg-ink-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${c.bar} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-xs text-ink-500">{desc}</p>

      {score < 75 && (
        <div className="mt-2 text-xs text-ink-400 border-t border-ink-200 pt-2">
          정확도 향상: 출생 시각(시·분) 및 출생지 좌표 입력 시 신뢰도 상승
        </div>
      )}
    </div>
  );
}
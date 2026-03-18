// @ts-nocheck
'use client'
/**
 * 분석 히스토리 패널
 * localStorage에 저장된 최근 10건 표시
 */
const REL_EMOJI = { romantic: '💑', work: '🤝', parent_child: '👨‍👩‍👧' };
const REL_LABELS = { romantic: '연애', work: '직장', parent_child: '부모-자녀' };

function scoreColor(score) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-500';
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function HistoryPanel({ history, onRestore, onClear }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="section-card animate-fade-up mb-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink-700 flex items-center gap-1.5">
          <span>🕐</span>
          최근 분석 히스토리
          <span className="text-xs font-normal text-ink-400">({history.length}건)</span>
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-ink-400 hover:text-red-500 transition-colors"
        >
          전체 삭제
        </button>
      </div>

      {/* 히스토리 목록 */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {history.map(item => (
          <button
            key={item.id}
            onClick={() => onRestore(item)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                       bg-ink-50 hover:bg-ink-100 border border-ink-200 hover:border-ink-300
                       transition-colors group"
          >
            {/* 관계 이모지 */}
            <span className="text-base flex-shrink-0">{REL_EMOJI[item.relType] || '☯'}</span>

            {/* 이름 + 관계 유형 */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-800 truncate">
                {item.nameA} × {item.nameB}
              </p>
              <p className="text-xs text-ink-400">{REL_LABELS[item.relType]} · {formatDate(item.date)}</p>
            </div>

            {/* 점수 */}
            {item.score !== null && (
              <span className={`text-sm font-bold flex-shrink-0 ${scoreColor(item.score)}`}>
                {item.score}점
              </span>
            )}

            {/* 화살표 */}
            <span className="text-ink-300 group-hover:text-ink-500 flex-shrink-0 text-xs">▶</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-ink-400 mt-2 text-right">클릭하면 결과를 다시 불러옵니다</p>
    </div>
  );
}
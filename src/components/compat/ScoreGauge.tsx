// @ts-nocheck
'use client'
import { useEffect, useRef, useState } from 'react';

/**
 * 원형 게이지 컴포넌트
 * SVG 기반, 애니메이션 포함
 */
export default function ScoreGauge({ score = 0, size = 180, label = '종합 궁합 점수' }) {
  const [displayScore, setDisplayScore] = useState(0);
  const animRef = useRef(null);

  // 점수 색상
  function getColor(s) {
    if (s >= 80) return '#059669'; // emerald
    if (s >= 65) return '#0284c7'; // sky
    if (s >= 50) return '#d97706'; // amber
    if (s >= 35) return '#dc2626'; // red
    return '#6b7280'; // gray
  }

  function getGrade(s) {
    if (s >= 85) return { grade: 'S', desc: '최고 인연' };
    if (s >= 75) return { grade: 'A', desc: '강한 인연' };
    if (s >= 65) return { grade: 'B+', desc: '양호' };
    if (s >= 55) return { grade: 'B', desc: '보통' };
    if (s >= 45) return { grade: 'C', desc: '노력 필요' };
    if (s >= 35) return { grade: 'D', desc: '도전적' };
    return { grade: 'F', desc: '위험 요소 다수' };
  }

  // 점수 숫자 카운트업 애니메이션
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [score]);

  const r = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  // 270° 호 (바닥부터 시계방향, -135° ~ +135°)
  const arcLength = circumference * 0.75;
  const filledLength = (score / 100) * arcLength;
  const dashOffset = arcLength - filledLength;

  const color = getColor(score);
  const { grade, desc } = getGrade(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(135deg)' }}>
          {/* 배경 트랙 */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#e5e2db"
            strokeWidth="12"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* 채워진 호 */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${filledLength} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: `drop-shadow(0 0 6px ${color}80)`
            }}
          />
        </svg>

        {/* 중앙 텍스트 */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: 'none' }}
        >
          <span className="text-4xl font-bold" style={{ color }}>{displayScore}</span>
          <span className="text-xs text-ink-400 mt-0.5">/ 100</span>
          <span className="text-sm font-bold mt-1" style={{ color }}>{grade}</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-ink-700">{label}</p>
        <p className="text-xs text-ink-400">{desc}</p>
      </div>
    </div>
  );
}
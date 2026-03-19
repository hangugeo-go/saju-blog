import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// GET /api/og?nameA=홍길동&nameB=김영희&score=87&label=천생연분
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const nameA = searchParams.get('nameA') || '인물 A'
  const nameB = searchParams.get('nameB') || '인물 B'
  const score = searchParams.get('score') || '?'
  const label = searchParams.get('label') || ''

  const numScore = parseInt(score, 10)
  const barWidth = isNaN(numScore) ? 0 : Math.max(0, Math.min(100, numScore))

  // Score color
  const scoreColor =
    numScore >= 80 ? '#6366f1' :
    numScore >= 60 ? '#10b981' :
    numScore >= 40 ? '#f59e0b' : '#ef4444'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '60px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <span style={{ fontSize: '36px' }}>☯</span>
          <span style={{ fontSize: '20px', color: '#a5b4fc', letterSpacing: '0.05em' }}>사주역학연구소</span>
        </div>

        {/* Names */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '16px',
            padding: '20px 40px',
            fontSize: '42px',
            fontWeight: 'bold',
          }}>
            {nameA}
          </div>
          <div style={{ fontSize: '32px', color: '#c4b5fd' }}>×</div>
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '16px',
            padding: '20px 40px',
            fontSize: '42px',
            fontWeight: 'bold',
          }}>
            {nameB}
          </div>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '80px', fontWeight: 'bold', color: scoreColor }}>{score}</span>
            <span style={{ fontSize: '28px', color: '#c4b5fd' }}>점</span>
          </div>
          {label && (
            <div style={{
              background: scoreColor,
              borderRadius: '100px',
              padding: '8px 28px',
              fontSize: '22px',
              fontWeight: 'bold',
              color: 'white',
            }}>
              {label}
            </div>
          )}
          {/* Progress bar */}
          <div style={{
            width: '400px',
            height: '12px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '100px',
            overflow: 'hidden',
            marginTop: '8px',
          }}>
            <div style={{
              width: `${barWidth}%`,
              height: '100%',
              background: scoreColor,
              borderRadius: '100px',
            }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '36px', fontSize: '16px', color: '#6366f1' }}>
          sajulab.com — 사주 · 자미두수 · 서양 점성술 통합 궁합 분석
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

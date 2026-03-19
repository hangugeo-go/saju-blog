import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/counter — 현재 카운트 반환
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ count: 52341 })
  }
  const { data, error } = await supabase
    .from('analysis_counter')
    .select('count')
    .eq('id', 1)
    .single()

  if (error || !data) {
    return NextResponse.json({ count: 52341 })
  }
  return NextResponse.json({ count: data.count })
}

// POST /api/counter — 카운트 +1 후 반환
export async function POST() {
  if (!supabase) {
    return NextResponse.json({ count: null }, { status: 500 })
  }
  const { data, error } = await supabase.rpc('increment_counter')

  if (error || !data) {
    return NextResponse.json({ count: null }, { status: 500 })
  }
  return NextResponse.json({ count: data })
}

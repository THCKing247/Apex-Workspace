import { createClient } from '@/lib/supabase/server'
import { generateReport, getWeeklyPeriod } from '@/lib/reports/generate'
import { generateNarrative } from '@/lib/reports/narrative'
import type { ReportType, ReportCadence } from '@/lib/reports/types'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, cadence = 'on_demand' } = await req.json() as { type: ReportType; cadence?: ReportCadence }
  const period = getWeeklyPeriod()

  const { data: record, error: insertErr } = await supabase
    .from('reports')
    .insert({ type, cadence, status: 'generating', period_start: period.start, period_end: period.end, data: null, narrative: null, error: null })
    .select('id')
    .single()

  if (insertErr || !record) return NextResponse.json({ error: 'Failed to create report record' }, { status: 500 })

  try {
    const data      = await generateReport(type, period)
    const narrative = await generateNarrative(type, data)
    await supabase.from('reports').update({ status: 'ready', data, narrative, generated_at: new Date().toISOString() }).eq('id', record.id)
    return NextResponse.json({ id: record.id, status: 'ready', data, narrative })
  } catch (err: any) {
    await supabase.from('reports').update({ status: 'error', error: err?.message ?? 'Unknown error' }).eq('id', record.id)
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}

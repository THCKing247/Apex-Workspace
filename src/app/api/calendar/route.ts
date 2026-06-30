import { NextRequest, NextResponse } from 'next/server'
import { listGoogleEvents, createGoogleEvent } from '@/lib/google-calendar'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year = searchParams.get('year') ?? new Date().getFullYear().toString()
  const month = searchParams.get('month') ?? String(new Date().getMonth() + 1)

  const start = new Date(Number(year), Number(month) - 1, 1)
  const end = new Date(Number(year), Number(month), 0, 23, 59, 59)

  const events = await listGoogleEvents(start.toISOString(), end.toISOString())
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, start, end, brand, project_id, lead_id } = body

  const googleEventId = await createGoogleEvent({
    summary: title,
    description,
    start,
    end,
  })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      google_event_id: googleEventId,
      title,
      description,
      start_time: start,
      end_time: end,
      brand: brand || null,
      linked_project_id: project_id || null,
      linked_lead_id: lead_id || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

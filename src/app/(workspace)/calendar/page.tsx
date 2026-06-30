import { createClient } from '@/lib/supabase/server'
import CalendarClient from './CalendarClient'

export const metadata = { title: 'Calendar — Apex Workspace' }
export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const supabase = await createClient()

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0)

  const [{ data: events }, { data: projects }, { data: leads }] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('id, title, start_time, end_time, brand, google_event_id')
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())
      .order('start_time', { ascending: true }),
    supabase.from('projects').select('id, name').eq('status', 'active'),
    supabase.from('leads').select('id, name').eq('status', 'open'),
  ])

  const googleConfigured = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  )

  return (
    <div className="space-y-4">
      <div>
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: '#5B9BFF', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
        >
          APEX — SCHEDULE
        </p>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
          Calendar
        </h1>
      </div>
      <CalendarClient
        initialEvents={events ?? []}
        projects={projects ?? []}
        leads={leads ?? []}
        googleConfigured={googleConfigured}
      />
    </div>
  )
}

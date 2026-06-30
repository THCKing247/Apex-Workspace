import { createClient } from '@/lib/supabase/server'
import CompetitorsClient from './CompetitorsClient'

export const metadata = { title: 'Competitors — Apex Workspace' }
export const dynamic = 'force-dynamic'

export default async function CompetitorsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competitors')
    .select('*')
    .order('last_reviewed', { ascending: true, nullsFirst: true })

  return (
    <div className="space-y-4">
      <div>
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: '#5B9BFF', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
        >
          APEX — INTEL
        </p>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
          Competitors
        </h1>
      </div>
      <CompetitorsClient initialCompetitors={data ?? []} />
    </div>
  )
}

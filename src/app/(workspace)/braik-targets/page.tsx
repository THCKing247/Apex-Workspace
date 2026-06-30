import { createClient } from '@/lib/supabase/server'
import BraikTargetsClient from './BraikTargetsClient'

export const metadata = { title: 'Braik Targets — Apex Workspace' }
export const dynamic = 'force-dynamic'

export default async function BraikTargetsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('braik_targets')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div>
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: '#FF7A33', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
        >
          BRAIK — SCHOOL OUTREACH
        </p>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
          Braik Targets
        </h1>
      </div>
      <BraikTargetsClient initialTargets={data ?? []} />
    </div>
  )
}

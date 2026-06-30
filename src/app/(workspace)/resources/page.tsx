import { createClient } from '@/lib/supabase/server'
import ResourcesClient from './ResourcesClient'

export const metadata = { title: 'Resources — Apex Workspace' }
export const dynamic = 'force-dynamic'

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div>
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: '#5B9BFF', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
        >
          APEX — LIBRARY
        </p>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
          Resources
        </h1>
      </div>
      <ResourcesClient initialResources={data ?? []} />
    </div>
  )
}

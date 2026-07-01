import { createClient } from '@/lib/supabase/server'
import ReportsClient from './ReportsClient'

export const metadata = { title: 'Reports — Apex Workspace' }
export const dynamic  = 'force-dynamic'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('status', 'ready')
    .order('generated_at', { ascending: false })
    .limit(12) // latest 2 per report type max

  return <ReportsClient existing={reports ?? []} />
}

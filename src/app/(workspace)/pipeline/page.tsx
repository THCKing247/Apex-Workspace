import { createClient } from '@/lib/supabase/server'
import PipelineBoard from './PipelineBoard'

export const metadata = { title: 'Pipeline — Apex Workspace' }

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  return <PipelineBoard initialLeads={leads ?? []} />
}

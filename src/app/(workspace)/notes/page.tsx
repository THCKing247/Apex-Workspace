import { createClient } from '@/lib/supabase/server'
import NotesClient from './NotesClient'

export const metadata = { title: 'Notes — Apex Workspace' }
export const dynamic = 'force-dynamic'

export default async function NotesPage() {
  const supabase = await createClient()

  const [{ data: notes }, { data: projects }, { data: leads }] = await Promise.all([
    supabase
      .from('notes')
      .select('*, projects(name), leads(name)')
      .order('updated_at', { ascending: false }),
    supabase.from('projects').select('id, name').eq('status', 'active'),
    supabase.from('leads').select('id, name'),
  ])

  return (
    <div className="space-y-4 h-full flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div>
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: '#5B9BFF', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
        >
          APEX — NOTES
        </p>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'monospace' }}>
          Notes
        </h1>
      </div>
      <div className="flex-1">
        <NotesClient
          initialNotes={notes ?? []}
          projects={projects ?? []}
          leads={leads ?? []}
        />
      </div>
    </div>
  )
}

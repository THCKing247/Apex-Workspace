'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X, Search } from 'lucide-react'
import { useAssistant } from '@/lib/assistant-context'

type BrandType = 'buildvance' | 'braik' | 'apex'
type FilterType = 'all' | BrandType | 'unlinked'

const BRAND_COLOR: Record<string, string> = {
  buildvance: '#00E08A',
  braik: '#FF7A33',
  apex: '#5B9BFF',
}

interface Note {
  id: string
  title: string
  content: string | null
  brand: BrandType | null
  linked_project_id: string | null
  linked_lead_id: string | null
  updated_at: string
  projects?: { name: string } | null
  leads?: { name: string } | null
}

interface Project { id: string; name: string }
interface Lead { id: string; name: string }

interface Props {
  initialNotes: Note[]
  projects: Project[]
  leads: Lead[]
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'buildvance', label: 'Buildvance' },
  { key: 'braik', label: 'Braik' },
  { key: 'apex', label: 'Apex' },
  { key: 'unlinked', label: 'Unlinked' },
]

export default function NotesClient({ initialNotes, projects, leads }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Note | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    brand: '' as BrandType | '',
    project_id: '',
    lead_id: '',
  })
  const supabase = createClient()
  const { logAction } = useAssistant()

  const filtered = notes.filter((n) => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'unlinked' ? !n.linked_project_id && !n.linked_lead_id :
      n.brand === filter
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  async function handleAddNote() {
    if (!form.title.trim()) return
    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: form.title,
        content: form.content || null,
        brand: form.brand || null,
        linked_project_id: form.project_id || null,
        linked_lead_id: form.lead_id || null,
      })
      .select('*, projects(name), leads(name)')
      .single()
    if (error) { toast.error('Failed to create note'); return }
    setNotes((prev) => [data, ...prev])
    logAction({ description: `Created note '${form.title}'`, page: '/notes', brand: (form.brand as 'buildvance' | 'braik' | 'apex' | null) || null })
    toast.success('Note saved')
    setShowAdd(false)
    setForm({ title: '', content: '', brand: '', project_id: '', lead_id: '' })
  }

  function openNote(note: Note) {
    setEditing(note)
    setEditTitle(note.title)
    setEditContent(note.content ?? '')
  }

  const handleSave = useCallback(async () => {
    if (!editing) return
    const { error } = await supabase
      .from('notes')
      .update({ title: editTitle, content: editContent, updated_at: new Date().toISOString() })
      .eq('id', editing.id)
    if (error) { toast.error('Failed to save'); return }
    setNotes((prev) =>
      prev.map((n) => n.id === editing.id ? { ...n, title: editTitle, content: editContent } : n)
    )
    logAction({ description: `Saved note '${editTitle}'`, page: '/notes', brand: editing.brand ?? null })
    toast.success('Note saved')
  }, [editing, editTitle, editContent, supabase, logAction])

  return (
    <div className="flex gap-4 h-full">
      {/* List */}
      <div className="w-72 flex-shrink-0 space-y-3">
        {/* Filter + search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#5d6b85' }} />
          <input
            className="w-full rounded border pl-7 pr-3 py-1.5 text-xs bg-transparent"
            style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace' }}
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-2 py-0.5 rounded text-xs"
              style={{
                fontFamily: 'monospace',
                backgroundColor: filter === key ? 'rgba(91,155,255,0.12)' : 'transparent',
                color: filter === key ? '#5B9BFF' : '#5d6b85',
                border: `1px solid ${filter === key ? '#5B9BFF' : '#1a2842'}`,
                fontSize: 9,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium"
          style={{ backgroundColor: '#5B9BFF', color: '#070a12', fontFamily: 'monospace' }}
        >
          <Plus size={12} /> New Note
        </button>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>
              No notes found
            </p>
          ) : (
            filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => openNote(n)}
                className="w-full text-left rounded-lg border p-3 transition-colors"
                style={{
                  backgroundColor: editing?.id === n.id ? '#0f1626' : '#0d1420',
                  borderColor: '#1a2842',
                  borderLeft: `3px solid ${n.brand ? BRAND_COLOR[n.brand] : '#1a2842'}`,
                }}
              >
                <p className="text-xs font-medium text-white truncate" style={{ fontFamily: 'monospace' }}>
                  {n.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {n.brand && (
                    <span className="text-xs" style={{ color: BRAND_COLOR[n.brand], fontFamily: 'monospace', fontSize: 9 }}>
                      {n.brand}
                    </span>
                  )}
                  {n.projects && (
                    <span className="text-xs" style={{ color: '#5d6b85', fontFamily: 'monospace', fontSize: 9 }}>
                      {n.projects.name}
                    </span>
                  )}
                  <span className="text-xs ml-auto" style={{ color: '#374151', fontFamily: 'monospace', fontSize: 9 }}>
                    {new Date(n.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div
        className="flex-1 rounded-lg border flex flex-col"
        style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
      >
        {editing ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: '#1a2842' }}>
              <input
                className="flex-1 text-sm font-semibold bg-transparent outline-none text-white"
                style={{ fontFamily: 'monospace' }}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSave}
              />
              <button onClick={() => setEditing(null)} style={{ color: '#5d6b85' }}><X size={14} /></button>
            </div>
            <textarea
              className="flex-1 p-5 text-sm bg-transparent resize-none outline-none"
              style={{ color: '#eef2f8', fontFamily: 'monospace', lineHeight: 1.7 }}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleSave}
              placeholder="Start writing..."
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs" style={{ color: '#374151', fontFamily: 'monospace' }}>
              Select a note or create a new one
            </p>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div
            className="rounded-lg border p-6 w-full max-w-md space-y-4"
            style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>New Note</h2>
              <button onClick={() => setShowAdd(false)} style={{ color: '#5d6b85' }}><X size={16} /></button>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Title *</label>
              <input
                className="w-full rounded border px-3 py-1.5 text-xs bg-transparent"
                style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace' }}
                placeholder="Note title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Content</label>
              <textarea
                className="w-full rounded border px-3 py-1.5 text-xs bg-transparent resize-none"
                style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace' }}
                rows={4}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Brand</label>
              <select
                className="w-full rounded border px-3 py-1.5 text-xs"
                style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace', backgroundColor: '#0d1420' }}
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value as BrandType | '' }))}
              >
                <option value="">None</option>
                <option value="buildvance">Buildvance</option>
                <option value="braik">Braik</option>
                <option value="apex">Apex</option>
              </select>
            </div>
            {projects.length > 0 && (
              <div>
                <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Link to Project</label>
                <select
                  className="w-full rounded border px-3 py-1.5 text-xs"
                  style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace', backgroundColor: '#0d1420' }}
                  value={form.project_id}
                  onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
                >
                  <option value="">None</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            {leads.length > 0 && (
              <div>
                <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Link to Lead</label>
                <select
                  className="w-full rounded border px-3 py-1.5 text-xs"
                  style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace', backgroundColor: '#0d1420' }}
                  value={form.lead_id}
                  onChange={(e) => setForm((f) => ({ ...f, lead_id: e.target.value }))}
                >
                  <option value="">None</option>
                  {leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-1.5 rounded text-xs"
                style={{ border: '1px solid #1a2842', color: '#5d6b85', fontFamily: 'monospace' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-1.5 rounded text-xs font-medium"
                style={{ backgroundColor: '#5B9BFF', color: '#070a12', fontFamily: 'monospace' }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

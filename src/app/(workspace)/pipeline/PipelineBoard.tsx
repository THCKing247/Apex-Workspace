'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, X, ChevronRight, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProspectDrawer from '@/components/ProspectDrawer'
import { toast } from 'sonner'

type LeadStatus = 'open' | 'contacted' | 'proposal' | 'closed'

interface Lead {
  id: string
  name: string
  company: string | null
  email: string | null
  status: LeadStatus
  source: string | null
  notes: string | null
  created_at: string
}

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'open', label: 'Open', color: '#3B82F6' },
  { id: 'contacted', label: 'Contacted', color: '#f59e0b' },
  { id: 'proposal', label: 'Proposal Sent', color: '#a855f7' },
  { id: 'closed', label: 'Closed', color: '#22c55e' },
]

const SOURCE_OPTIONS = ['Referral', 'Chamber', 'Cold Outreach', 'Braik Network', 'Social Media', 'Other']

function daysAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  return diff === 0 ? 'today' : `${diff}d ago`
}

interface AddLeadModalProps {
  onClose: () => void
  onAdd: (lead: Omit<Lead, 'id' | 'created_at'>) => Promise<void>
  prefill?: Partial<Lead>
}

function AddLeadModal({ onClose, onAdd, prefill }: AddLeadModalProps) {
  const [form, setForm] = useState({
    name: prefill?.name ?? '',
    company: prefill?.company ?? '',
    email: prefill?.email ?? '',
    source: prefill?.source ?? 'Referral',
    notes: prefill?.notes ?? '',
    status: (prefill?.status ?? 'open') as LeadStatus,
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onAdd(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="w-full max-w-md rounded-lg border p-6 space-y-4"
        style={{ backgroundColor: '#13161f', borderColor: '#1e2330' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>Add Lead</h2>
          <button onClick={onClose} style={{ color: '#6b7280' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: 'Name *', key: 'name', type: 'text', required: true },
            { label: 'Company', key: 'company', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
          ].map(({ label, key, type, required }) => (
            <div key={key}>
              <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>{label}</label>
              <input
                type={type}
                required={required}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded border text-sm text-white outline-none focus:border-blue-500"
                style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
              />
            </div>
          ))}

          <div>
            <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>Source</label>
            <select
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              className="w-full px-3 py-2 rounded border text-sm text-white outline-none"
              style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
            >
              {SOURCE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded border text-sm text-white outline-none resize-none"
              style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 rounded text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: '#3B82F6' }}
          >
            {saving ? 'Adding…' : 'Add Lead'}
          </button>
        </form>
      </div>
    </div>
  )
}

interface SlideOverProps {
  lead: Lead
  onClose: () => void
  onUpdate: (id: string, notes: string) => Promise<void>
}

function SlideOver({ lead, onClose, onUpdate }: SlideOverProps) {
  const [notes, setNotes] = useState(lead.notes ?? '')

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-md h-full overflow-y-auto border-l p-6 space-y-5"
        style={{ backgroundColor: '#13161f', borderColor: '#1e2330' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>{lead.name}</h2>
          <button onClick={onClose} style={{ color: '#6b7280' }}><X size={16} /></button>
        </div>

        <div className="space-y-2 text-sm">
          {[
            { label: 'Company', value: lead.company },
            { label: 'Email', value: lead.email },
            { label: 'Source', value: lead.source },
            { label: 'Added', value: new Date(lead.created_at).toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-3">
              <span className="text-xs w-20 shrink-0" style={{ color: '#6b7280' }}>{label}</span>
              <span className="text-xs text-white">{value ?? '—'}</span>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: '#6b7280' }}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onUpdate(lead.id, notes)}
            rows={6}
            className="w-full px-3 py-2 rounded border text-sm text-white outline-none resize-none focus:border-blue-500"
            style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
            placeholder="Add notes…"
          />
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Auto-saves on blur</p>
        </div>
      </div>
    </div>
  )
}

export default function PipelineBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [showAdd, setShowAdd] = useState(false)
  const [showProspect, setShowProspect] = useState(false)
  const [addPrefill, setAddPrefill] = useState<Partial<Lead> | undefined>()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStatus = destination.droppableId as LeadStatus

    setLeads((prev) =>
      prev.map((l) => (l.id === draggableId ? { ...l, status: newStatus } : l))
    )

    await supabase.from('leads').update({ status: newStatus }).eq('id', draggableId)
    toast.success('Lead status updated')
  }

  async function handleAddLead(data: Omit<Lead, 'id' | 'created_at'>) {
    const { data: inserted } = await supabase
      .from('leads')
      .insert(data)
      .select()
      .single()
    if (inserted) {
      setLeads((prev) => [inserted, ...prev])
      toast.success('Lead added')
    }
  }

  async function handleUpdateNotes(id: string, notes: string) {
    await supabase.from('leads').update({ notes }).eq('id', id)
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)))
    toast.success('Notes saved')
  }

  function openProspect(prefill: Partial<Lead>) {
    setAddPrefill(prefill)
    setShowAdd(true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'monospace' }}>Pipeline</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProspect(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium border"
            style={{ borderColor: '#1e2330', color: '#9ca3af' }}
          >
            <Search size={14} /> Prospect
          </button>
          <button
            onClick={() => { setAddPrefill(undefined); setShowAdd(true) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium text-white"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colLeads = leads.filter((l) => l.status === col.id)
            return (
              <div key={col.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-xs font-semibold" style={{ color: col.color, fontFamily: 'monospace' }}>
                    {col.label}
                  </span>
                  <span className="text-xs ml-auto px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1e2330', color: '#6b7280' }}>
                    {colLeads.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-32 rounded-lg space-y-2 p-2"
                      style={{
                        backgroundColor: snapshot.isDraggingOver ? '#1a1d2e' : 'transparent',
                        border: `1px dashed ${snapshot.isDraggingOver ? col.color : '#1e2330'}`,
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {colLeads.length === 0 && !snapshot.isDraggingOver && (
                        <p className="text-center text-xs py-6" style={{ color: '#374151' }}>
                          Drop leads here
                        </p>
                      )}

                      {colLeads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onClick={() => setSelectedLead(lead)}
                              className="rounded-lg border p-3 cursor-pointer group"
                              style={{
                                backgroundColor: snap.isDragging ? '#1e2330' : '#1a1d2e',
                                borderColor: '#1e2330',
                                boxShadow: snap.isDragging ? '0 4px 16px rgba(0,0,0,0.4)' : undefined,
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-white">{lead.name}</p>
                                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{lead.company ?? '—'}</p>
                                </div>
                                <ChevronRight size={13} style={{ color: '#374151' }} className="group-hover:text-gray-500 mt-0.5" />
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {lead.source && (
                                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1e2330', color: '#6b7280' }}>
                                    {lead.source}
                                  </span>
                                )}
                                <span className="text-xs ml-auto" style={{ color: '#374151' }}>
                                  {daysAgo(lead.created_at)}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {showAdd && (
        <AddLeadModal onClose={() => setShowAdd(false)} onAdd={handleAddLead} prefill={addPrefill} />
      )}

      {selectedLead && (
        <SlideOver lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleUpdateNotes} />
      )}

      {showProspect && (
        <ProspectDrawer
          onClose={() => setShowProspect(false)}
          onAddToPipeline={(data) => {
            setShowProspect(false)
            openProspect(data)
          }}
        />
      )}
    </>
  )
}

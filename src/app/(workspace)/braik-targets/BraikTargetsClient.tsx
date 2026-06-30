'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'

type TargetStatus = 'identified' | 'researching' | 'outreach_sent' | 'responded' | 'converted'

interface BraikTarget {
  id: string
  school_name: string
  state: string | null
  lat: number | null
  lng: number | null
  contact_name: string | null
  contact_email: string | null
  status: TargetStatus
  notes: string | null
  created_at: string
}

const STATUS_LABELS: Record<TargetStatus, string> = {
  identified: 'Identified',
  researching: 'Researching',
  outreach_sent: 'Outreach Sent',
  responded: 'Responded',
  converted: 'Converted',
}

const ALL_STATUSES: TargetStatus[] = ['identified', 'researching', 'outreach_sent', 'responded', 'converted']

const ORANGE = '#FF7A33'

interface Props {
  initialTargets: BraikTarget[]
}

export default function BraikTargetsClient({ initialTargets }: Props) {
  const [targets, setTargets] = useState<BraikTarget[]>(initialTargets)
  const [activeFilter, setActiveFilter] = useState<TargetStatus | 'all'>('all')
  const [selected, setSelected] = useState<BraikTarget | null>(null)
  const [notes, setNotes] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    school_name: '',
    state: '',
    lat: '',
    lng: '',
    contact_name: '',
    contact_email: '',
    status: 'identified' as TargetStatus,
    notes: '',
  })
  const supabase = createClient()

  const filtered = activeFilter === 'all' ? targets : targets.filter((t) => t.status === activeFilter)

  const stats = {
    total: targets.length,
    outreach: targets.filter((t) => t.status === 'outreach_sent' || t.status === 'responded').length,
    converted: targets.filter((t) => t.status === 'converted').length,
  }

  async function handleAddTarget() {
    if (!form.school_name.trim()) return
    const { data, error } = await supabase
      .from('braik_targets')
      .insert({
        school_name: form.school_name,
        state: form.state || null,
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        contact_name: form.contact_name || null,
        contact_email: form.contact_email || null,
        status: form.status,
        notes: form.notes || null,
      })
      .select()
      .single()
    if (error) { toast.error('Failed to add target'); return }
    setTargets((prev) => [data, ...prev])
    toast.success('Target added')
    setShowAdd(false)
    setForm({ school_name: '', state: '', lat: '', lng: '', contact_name: '', contact_email: '', status: 'identified', notes: '' })
  }

  async function handleSaveNotes() {
    if (!selected) return
    const { error } = await supabase
      .from('braik_targets')
      .update({ notes })
      .eq('id', selected.id)
    if (error) { toast.error('Failed to save'); return }
    setTargets((prev) => prev.map((t) => t.id === selected.id ? { ...t, notes } : t))
    toast.success('Notes saved')
  }

  function openTarget(t: BraikTarget) {
    setSelected(t)
    setNotes(t.notes ?? '')
  }

  return (
    <div className="space-y-4">
      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Targets', value: stats.total },
          { label: 'Outreach Sent', value: stats.outreach },
          { label: 'Converted', value: stats.converted },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border p-3"
            style={{ backgroundColor: '#0d1420', borderColor: '#2a1810' }}
          >
            <p className="text-xs uppercase tracking-widest" style={{ color: '#8b4513', fontFamily: 'monospace', fontSize: 10 }}>
              {label}
            </p>
            <p className="text-xl font-bold mt-1" style={{ fontFamily: 'monospace', color: ORANGE }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs + add button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(['all', ...ALL_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className="px-3 py-1 rounded text-xs transition-colors"
              style={{
                fontFamily: 'monospace',
                backgroundColor: activeFilter === s ? `${ORANGE}22` : 'transparent',
                color: activeFilter === s ? ORANGE : '#5d6b85',
                border: `1px solid ${activeFilter === s ? ORANGE : '#1a2842'}`,
              }}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
          style={{ backgroundColor: ORANGE, color: '#070a12', fontFamily: 'monospace' }}
        >
          <Plus size={12} /> Add Target
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
      >
        <table className="w-full text-xs" style={{ fontFamily: 'monospace' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a2842' }}>
              {['School', 'State', 'Contact', 'Status'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 uppercase tracking-widest"
                  style={{ color: '#5d6b85', fontSize: 9, letterSpacing: '0.05em' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center" style={{ color: '#5d6b85' }}>
                  No targets yet
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid #0f1626' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f1626')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => openTarget(t)}
                >
                  <td className="px-4 py-2.5 text-white">{t.school_name}</td>
                  <td className="px-4 py-2.5" style={{ color: '#8b95ab' }}>{t.state ?? '—'}</td>
                  <td className="px-4 py-2.5" style={{ color: '#8b95ab' }}>{t.contact_name ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${ORANGE}18`, color: ORANGE, fontSize: 9 }}
                    >
                      {STATUS_LABELS[t.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div
          className="fixed inset-y-0 right-0 w-96 border-l z-50 flex flex-col"
          style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#1a2842' }}>
            <div>
              <p className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>
                {selected.school_name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>
                {selected.state ?? 'No state'} · {STATUS_LABELS[selected.status]}
              </p>
            </div>
            <button onClick={() => setSelected(null)} style={{ color: '#5d6b85' }}>
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {selected.contact_name && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace', fontSize: 9 }}>
                  Contact
                </p>
                <p className="text-sm text-white" style={{ fontFamily: 'monospace' }}>{selected.contact_name}</p>
                {selected.contact_email && (
                  <p className="text-xs mt-0.5" style={{ color: '#8b95ab', fontFamily: 'monospace' }}>{selected.contact_email}</p>
                )}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#5d6b85', fontFamily: 'monospace', fontSize: 9 }}>
                Notes
              </p>
              <textarea
                className="w-full rounded border p-2 text-xs resize-none bg-transparent"
                style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace', minHeight: 120 }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="Add notes..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div
            className="rounded-lg border p-6 w-full max-w-md space-y-4"
            style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>Add Target</h2>
              <button onClick={() => setShowAdd(false)} style={{ color: '#5d6b85' }}><X size={16} /></button>
            </div>
            {[
              { key: 'school_name', label: 'School Name *', placeholder: 'Lincoln High School' },
              { key: 'state', label: 'State', placeholder: 'Florida' },
              { key: 'lat', label: 'Lat (optional)', placeholder: '27.8' },
              { key: 'lng', label: 'Lng (optional)', placeholder: '-81.6' },
              { key: 'contact_name', label: 'Contact Name', placeholder: 'Coach Smith' },
              { key: 'contact_email', label: 'Contact Email', placeholder: 'smith@school.edu' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>{label}</label>
                <input
                  className="w-full rounded border px-3 py-1.5 text-xs bg-transparent"
                  style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace' }}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Status</label>
              <select
                className="w-full rounded border px-3 py-1.5 text-xs"
                style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace', backgroundColor: '#0d1420' }}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TargetStatus }))}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Notes</label>
              <textarea
                className="w-full rounded border px-3 py-1.5 text-xs bg-transparent resize-none"
                style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace' }}
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-1.5 rounded text-xs"
                style={{ border: '1px solid #1a2842', color: '#5d6b85', fontFamily: 'monospace' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTarget}
                className="px-4 py-1.5 rounded text-xs font-medium"
                style={{ backgroundColor: ORANGE, color: '#070a12', fontFamily: 'monospace' }}
              >
                Add Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

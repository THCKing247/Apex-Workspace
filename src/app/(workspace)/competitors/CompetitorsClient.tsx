// v2: data_source='api' rows can be populated via SEO/scraping APIs (see API mega-list)
// -- domain-search and SEO-tools categories are good candidates.
// -- Structure already supports this without migration.

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X, ExternalLink, Pencil } from 'lucide-react'

type BrandType = 'buildvance' | 'braik' | 'apex'

interface Competitor {
  id: string
  name: string
  brand: BrandType
  website: string | null
  pricing_notes: string | null
  positioning_notes: string | null
  data_source: 'manual' | 'api'
  last_reviewed: string | null
  created_at: string
}

const BRAND_COLOR: Record<BrandType, string> = {
  buildvance: '#00E08A',
  braik: '#FF7A33',
  apex: '#5B9BFF',
}

interface Props {
  initialCompetitors: Competitor[]
}

const emptyForm = {
  name: '',
  brand: 'buildvance' as BrandType,
  website: '',
  pricing_notes: '',
  positioning_notes: '',
  last_reviewed: '',
}

export default function CompetitorsClient({ initialCompetitors }: Props) {
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Competitor | null>(null)
  const [form, setForm] = useState(emptyForm)
  const supabase = createClient()

  const buildvance = competitors.filter((c) => c.brand === 'buildvance')
  const braik = competitors.filter((c) => c.brand === 'braik')

  function openEdit(c: Competitor) {
    setEditing(c)
    setForm({
      name: c.name,
      brand: c.brand,
      website: c.website ?? '',
      pricing_notes: c.pricing_notes ?? '',
      positioning_notes: c.positioning_notes ?? '',
      last_reviewed: c.last_reviewed ?? '',
    })
    setShowAdd(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return

    if (editing) {
      const { error } = await supabase
        .from('competitors')
        .update({
          name: form.name,
          brand: form.brand,
          website: form.website || null,
          pricing_notes: form.pricing_notes || null,
          positioning_notes: form.positioning_notes || null,
          last_reviewed: form.last_reviewed || null,
        })
        .eq('id', editing.id)
      if (error) { toast.error('Failed to update'); return }
      setCompetitors((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? { ...c, ...form, website: form.website || null, pricing_notes: form.pricing_notes || null, positioning_notes: form.positioning_notes || null, last_reviewed: form.last_reviewed || null }
            : c
        )
      )
      toast.success('Competitor updated')
    } else {
      const { data, error } = await supabase
        .from('competitors')
        .insert({
          name: form.name,
          brand: form.brand,
          website: form.website || null,
          pricing_notes: form.pricing_notes || null,
          positioning_notes: form.positioning_notes || null,
          last_reviewed: form.last_reviewed || null,
        })
        .select()
        .single()
      if (error) { toast.error('Failed to add'); return }
      setCompetitors((prev) => [...prev, data])
      toast.success('Competitor added')
    }

    setShowAdd(false)
    setEditing(null)
    setForm(emptyForm)
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('competitors').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    setCompetitors((prev) => prev.filter((c) => c.id !== id))
    toast.success('Competitor removed')
  }

  function CompetitorCard({ c }: { c: Competitor }) {
    const staleDays = c.last_reviewed
      ? Math.floor((Date.now() - new Date(c.last_reviewed).getTime()) / 86400000)
      : null
    return (
      <div
        className="rounded-lg border p-4 space-y-3"
        style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>
                {c.name}
              </p>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: c.data_source === 'api' ? 'rgba(91,155,255,0.12)' : 'rgba(93,107,133,0.15)',
                  color: c.data_source === 'api' ? '#5B9BFF' : '#5d6b85',
                  fontFamily: 'monospace',
                  fontSize: 9,
                }}
              >
                {c.data_source}
              </span>
            </div>
            {c.website && (
              <a
                href={c.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs mt-0.5"
                style={{ color: '#5d6b85', fontFamily: 'monospace' }}
              >
                <ExternalLink size={9} />
                {c.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => openEdit(c)} style={{ color: '#5d6b85' }}><Pencil size={12} /></button>
            <button onClick={() => handleDelete(c.id)} style={{ color: '#374151' }}><X size={12} /></button>
          </div>
        </div>
        {c.pricing_notes && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#5d6b85', fontFamily: 'monospace', fontSize: 9 }}>
              Pricing
            </p>
            <p className="text-xs" style={{ color: '#8b95ab', fontFamily: 'monospace' }}>{c.pricing_notes}</p>
          </div>
        )}
        {c.positioning_notes && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#5d6b85', fontFamily: 'monospace', fontSize: 9 }}>
              Positioning
            </p>
            <p className="text-xs" style={{ color: '#8b95ab', fontFamily: 'monospace' }}>{c.positioning_notes}</p>
          </div>
        )}
        {c.last_reviewed && (
          <p className="text-xs" style={{ color: staleDays && staleDays > 30 ? '#f59e0b' : '#374151', fontFamily: 'monospace', fontSize: 9 }}>
            Last reviewed: {new Date(c.last_reviewed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {staleDays && staleDays > 30 ? ' — needs refresh' : ''}
          </p>
        )}
      </div>
    )
  }

  function Section({ brand, items }: { brand: BrandType; items: Competitor[] }) {
    const color = BRAND_COLOR[brand]
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h2
            className="text-sm font-semibold capitalize"
            style={{ color, fontFamily: 'monospace' }}
          >
            {brand} competitors
          </h2>
          <div className="flex-1 h-px" style={{ backgroundColor: `${color}22` }} />
          <span className="text-xs" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>
            {items.length}
          </span>
        </div>
        {items.length === 0 ? (
          <p className="text-xs py-4" style={{ color: '#374151', fontFamily: 'monospace' }}>
            No competitors tracked yet
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((c) => <CompetitorCard key={c.id} c={c} />)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setShowAdd(true) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
          style={{ backgroundColor: '#5B9BFF', color: '#070a12', fontFamily: 'monospace' }}
        >
          <Plus size={12} /> Add Competitor
        </button>
      </div>

      <Section brand="buildvance" items={buildvance} />
      <Section brand="braik" items={braik} />

      {/* Add/edit modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div
            className="rounded-lg border p-6 w-full max-w-md space-y-4"
            style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>
                {editing ? 'Edit Competitor' : 'Add Competitor'}
              </h2>
              <button
                onClick={() => { setShowAdd(false); setEditing(null); setForm(emptyForm) }}
                style={{ color: '#5d6b85' }}
              >
                <X size={16} />
              </button>
            </div>
            {[
              { key: 'name', label: 'Name *', placeholder: 'Acme Software' },
              { key: 'website', label: 'Website', placeholder: 'https://acme.com' },
              { key: 'pricing_notes', label: 'Pricing Notes', placeholder: '$99/mo, no free tier' },
              { key: 'positioning_notes', label: 'Positioning Notes', placeholder: 'They focus on enterprise...' },
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Brand</label>
                <select
                  className="w-full rounded border px-3 py-1.5 text-xs"
                  style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace', backgroundColor: '#0d1420' }}
                  value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value as BrandType }))}
                >
                  <option value="buildvance">Buildvance</option>
                  <option value="braik">Braik</option>
                  <option value="apex">Apex</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Last Reviewed</label>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-1.5 text-xs bg-transparent"
                  style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace' }}
                  value={form.last_reviewed}
                  onChange={(e) => setForm((f) => ({ ...f, last_reviewed: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowAdd(false); setEditing(null); setForm(emptyForm) }}
                className="px-4 py-1.5 rounded text-xs"
                style={{ border: '1px solid #1a2842', color: '#5d6b85', fontFamily: 'monospace' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded text-xs font-medium"
                style={{ backgroundColor: '#5B9BFF', color: '#070a12', fontFamily: 'monospace' }}
              >
                {editing ? 'Save Changes' : 'Add Competitor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

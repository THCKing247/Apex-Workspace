'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X, ExternalLink, Key, Image, FileText, FileSignature, Folder, AlertTriangle } from 'lucide-react'
import { useScopedFilter } from '@/lib/use-scoped-filter'
import ScopeFilterBanner from '@/components/ScopeFilterBanner'

type Category = 'credentials' | 'brand_assets' | 'templates' | 'contracts' | 'other'
type BrandType = 'buildvance' | 'braik' | 'apex'
type FilterType = Category | 'all'

const BRAND_COLOR: Record<string, string> = {
  buildvance: '#00E08A',
  braik: '#FF7A33',
  apex: '#5B9BFF',
}

const CATEGORY_META: Record<Category, { label: string; Icon: React.ElementType }> = {
  credentials: { label: 'Credentials', Icon: Key },
  brand_assets: { label: 'Brand Assets', Icon: Image },
  templates: { label: 'Templates', Icon: FileText },
  contracts: { label: 'Contracts', Icon: FileSignature },
  other: { label: 'Other', Icon: Folder },
}

const ALL_CATEGORIES: Category[] = ['credentials', 'brand_assets', 'templates', 'contracts', 'other']

interface Resource {
  id: string
  title: string
  url: string | null
  category: Category
  brand: BrandType | null
  notes: string | null
  created_at: string
}

interface Props {
  initialResources: Resource[]
}

export default function ResourcesClient({ initialResources }: Props) {
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    title: '',
    url: '',
    category: 'other' as Category,
    brand: '' as BrandType | '',
    notes: '',
  })
  const supabase = createClient()

  const { filtered: scopedResources, hiddenCount } = useScopedFilter(resources)
  const filtered = filter === 'all' ? scopedResources : scopedResources.filter((r) => r.category === filter)
  const grouped = ALL_CATEGORIES.reduce<Record<Category, Resource[]>>((acc, cat) => {
    acc[cat] = (filter === 'all' ? scopedResources : filtered).filter((r) => r.category === cat)
    return acc
  }, { credentials: [], brand_assets: [], templates: [], contracts: [], other: [] })

  async function handleAdd() {
    if (!form.title.trim()) return
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: form.title,
        url: form.url || null,
        category: form.category,
        brand: form.brand || null,
        notes: form.notes || null,
      })
      .select()
      .single()
    if (error) { toast.error('Failed to add resource'); return }
    setResources((prev) => [data, ...prev])
    toast.success('Resource added')
    setShowAdd(false)
    setForm({ title: '', url: '', category: 'other', brand: '', notes: '' })
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    setResources((prev) => prev.filter((r) => r.id !== id))
    toast.success('Resource deleted')
  }

  const displayCategories = filter === 'all' ? ALL_CATEGORIES : [filter as Category]

  return (
    <div className="space-y-4">
      <ScopeFilterBanner hiddenCount={hiddenCount} />
      {/* Filter tabs + add */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className="px-3 py-1 rounded text-xs"
            style={{
              fontFamily: 'monospace',
              backgroundColor: filter === 'all' ? 'rgba(91,155,255,0.12)' : 'transparent',
              color: filter === 'all' ? '#5B9BFF' : '#5d6b85',
              border: `1px solid ${filter === 'all' ? '#5B9BFF' : '#1a2842'}`,
            }}
          >
            All
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const { label, Icon } = CATEGORY_META[cat]
            const active = filter === cat
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="flex items-center gap-1 px-3 py-1 rounded text-xs"
                style={{
                  fontFamily: 'monospace',
                  backgroundColor: active ? 'rgba(91,155,255,0.12)' : 'transparent',
                  color: active ? '#5B9BFF' : '#5d6b85',
                  border: `1px solid ${active ? '#5B9BFF' : '#1a2842'}`,
                }}
              >
                <Icon size={10} />
                {label}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
          style={{ backgroundColor: '#5B9BFF', color: '#070a12', fontFamily: 'monospace' }}
        >
          <Plus size={12} /> Add Resource
        </button>
      </div>

      {/* Credentials warning */}
      {(filter === 'credentials' || filter === 'all') && grouped.credentials.length > 0 && (
        <div
          className="flex items-start gap-2 px-3 py-2 rounded-lg border text-xs"
          style={{ borderColor: '#2a1810', backgroundColor: 'rgba(255,122,51,0.06)', fontFamily: 'monospace', color: '#8b95ab' }}
        >
          <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#FF7A33' }} />
          Don&apos;t store actual passwords here. Use this as a pointer to your password manager entry, not a replacement for one.
        </div>
      )}

      {/* Grouped sections */}
      {displayCategories.map((cat) => {
        const items = grouped[cat]
        const { label, Icon } = CATEGORY_META[cat]
        if (filter !== 'all' && items.length === 0) {
          return (
            <p key={cat} className="text-xs text-center py-8" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>
              No {label.toLowerCase()} resources yet
            </p>
          )
        }
        if (items.length === 0) return null
        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon size={12} style={{ color: '#5d6b85' }} />
              <p className="text-xs uppercase tracking-widest" style={{ color: '#5d6b85', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 9 }}>
                {label}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border p-3 flex flex-col gap-2"
                  style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate" style={{ fontFamily: 'monospace' }}>
                        {r.title}
                      </p>
                      {r.notes && (
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#8b95ab', fontFamily: 'monospace' }}>
                          {r.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#5d6b85' }}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                      <button onClick={() => handleDelete(r.id)} style={{ color: '#374151' }}>
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  {r.brand && (
                    <span
                      className="self-start text-xs px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${BRAND_COLOR[r.brand]}18`, color: BRAND_COLOR[r.brand], fontFamily: 'monospace', fontSize: 9 }}
                    >
                      {r.brand}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <p className="text-xs text-center py-12" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>
          No resources yet — add links, docs, and credentials pointers here
        </p>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div
            className="rounded-lg border p-6 w-full max-w-md space-y-4"
            style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>Add Resource</h2>
              <button onClick={() => setShowAdd(false)} style={{ color: '#5d6b85' }}><X size={16} /></button>
            </div>
            {[
              { key: 'title', label: 'Title *', placeholder: '1Password entry: Vercel' },
              { key: 'url', label: 'URL', placeholder: 'https://...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>{label}</label>
                <input
                  className="w-full rounded border px-3 py-1.5 text-xs bg-transparent"
                  style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace' }}
                  placeholder={placeholder}
                  value={form[key as 'title' | 'url']}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Category</label>
                <select
                  className="w-full rounded border px-3 py-1.5 text-xs"
                  style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace', backgroundColor: '#0d1420' }}
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_META[c].label}</option>
                  ))}
                </select>
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
                onClick={handleAdd}
                className="px-4 py-1.5 rounded text-xs font-medium"
                style={{ backgroundColor: '#5B9BFF', color: '#070a12', fontFamily: 'monospace' }}
              >
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Users, GitBranch, Target, FileText, Radar, FolderOpen, Loader2 } from 'lucide-react'
import type { SearchResult } from '@/app/api/search/route'

// ─── Command-palette style search — Cmd+K opens it from anywhere ────────────
// Replaces the old persistent top-bar search bar now that the header is gone.

const TYPE_ICON: Record<string, React.ElementType> = {
  lead: Users, project: GitBranch, braik_target: Target, note: FileText, competitor: Radar, resource: FolderOpen,
}
const TYPE_LABEL: Record<string, string> = {
  lead: 'Lead', project: 'Project', braik_target: 'Braik Target', note: 'Note', competitor: 'Competitor', resource: 'Resource',
}
const BRAND_COLOR: Record<string, string> = { buildvance: 'var(--buildvance)', braik: 'var(--braik)', apex: 'var(--apex)' }

export default function GlobalSearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef  = useRef<HTMLInputElement>(null)
  const debounce  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router    = useRouter()

  const search = useCallback((q: string) => {
    if (debounce.current) clearTimeout(debounce.current)
    if (q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    debounce.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const json = await res.json()
        setResults(json.results ?? [])
        setSelected(0)
      } finally { setLoading(false) }
    }, 220)
  }, [])

  useEffect(() => { search(query) }, [query, search])
  useEffect(() => { if (open) { setQuery(''); setResults([]); setTimeout(() => inputRef.current?.focus(), 30) } }, [open])

  // Global Cmd+K listener — works even when overlay is closed
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (!open) window.dispatchEvent(new CustomEvent('open-search')) }
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function goTo(r: SearchResult) { router.push(r.href); onClose() }

  function onKeyDown(e: React.KeyboardEvent) {
    if (results.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter')     { e.preventDefault(); goTo(results[selected]) }
  }

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(13,27,61,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: 560, background: 'var(--shell-bg)', border: '1px solid var(--shell-border)', borderRadius: 12, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--shell-border)' }}>
          <Search size={16} style={{ color: 'var(--apex)' }} />
          <input
            ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Search leads, projects, targets, notes…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--shell-ink)', fontSize: 14 }}
          />
          {loading ? <Loader2 size={14} className="animate-spin" style={{ color: 'var(--apex)' }} /> : (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-ink-muted)' }}><X size={15} /></button>
          )}
        </div>
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {results.length === 0 && query.length >= 2 && !loading && (
            <p style={{ padding: 20, fontSize: 13, color: 'var(--shell-ink-muted)', textAlign: 'center' }}>No results for &quot;{query}&quot;</p>
          )}
          {results.map((r, i) => {
            const Icon = TYPE_ICON[r.type]; const color = BRAND_COLOR[r.brand] ?? 'var(--apex)'; const sel = i === selected
            return (
              <button key={`${r.type}-${r.id}`} onClick={() => goTo(r)} onMouseEnter={() => setSelected(i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: sel ? 'rgba(91,155,255,0.1)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, background: `color-mix(in srgb, ${color} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-display" style={{ color: 'var(--shell-ink)', fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--shell-ink-muted)' }}>{r.subtitle}</p>
                </div>
                <span className="font-display uppercase" style={{ fontSize: 9, color, letterSpacing: '0.05em' }}>{TYPE_LABEL[r.type]}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

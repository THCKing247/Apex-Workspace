'use client'

import { useBrandScope } from '@/lib/brand-scope-context'
import { Filter, X } from 'lucide-react'

const BRAND_COLOR: Record<string, string> = {
  buildvance: 'var(--buildvance)',
  braik:      'var(--braik)',
  apex:       'var(--apex)',
}
const BRAND_LABEL: Record<string, string> = {
  buildvance: 'Buildvance',
  braik:      'Braik',
  apex:       'Apex',
}

// ─── Small inline banner for scoped list pages ─────────────────────────────
// Shows "Viewing: Braik only — 4 hidden" with one-click "Show all" reset.
// Only renders when scope !== 'all'.

export default function ScopeFilterBanner({ hiddenCount }: { hiddenCount: number }) {
  const { scope, setScope } = useBrandScope()
  if (scope === 'all') return null

  const color = BRAND_COLOR[scope]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 14px', borderRadius: 8, marginBottom: 14,
      background: `color-mix(in srgb, ${color} 6%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Filter size={12} style={{ color }} />
        <span className="font-display uppercase" style={{ color, fontSize: 11, letterSpacing: '0.05em' }}>
          Viewing {BRAND_LABEL[scope]} only
        </span>
        {hiddenCount > 0 && (
          <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
            · {hiddenCount} item{hiddenCount === 1 ? '' : 's'} hidden
          </span>
        )}
      </div>
      <button
        onClick={() => setScope('all')}
        className="font-display uppercase"
        style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px',
          borderRadius: 5, fontSize: 10, letterSpacing: '0.05em', cursor: 'pointer',
          background: 'transparent', color: 'var(--ink-muted)', border: '1px solid var(--card-border)',
        }}
      >
        <X size={10} /> Show all
      </button>
    </div>
  )
}

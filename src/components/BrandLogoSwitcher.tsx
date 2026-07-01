'use client'

import { useBrandScope, type BrandScope } from '@/lib/brand-scope-context'
import { Mountain, GitBranch, Trophy } from 'lucide-react'

// ─── Brand logo switcher ────────────────────────────────────────────────────
// Three marks: Apex (mountain = all), Buildvance (branch), Braik (trophy).
// size="compact"  -> top bar, always visible
// size="large"    -> dashboard hero row
// Both read/write the SAME context — clicking either updates everywhere.

const BRANDS: Array<{ id: BrandScope; label: string; icon: React.ElementType; color: string }> = [
  { id: 'all',        label: 'Apex TSG',   icon: Mountain,  color: 'var(--apex)'       },
  { id: 'buildvance', label: 'Buildvance', icon: GitBranch, color: 'var(--buildvance)' },
  { id: 'braik',      label: 'Braik',      icon: Trophy,    color: 'var(--braik)'      },
]

export default function BrandLogoSwitcher({ size = 'compact' }: { size?: 'compact' | 'large' }) {
  const { scope, setScope } = useBrandScope()

  if (size === 'compact') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: 3,
        background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--shell-border)',
      }}>
        {BRANDS.map(({ id, label, icon: Icon, color }) => {
          const active = scope === id
          return (
            <button
              key={id}
              onClick={() => setScope(id)}
              title={id === 'all' ? 'Apex TSG — all businesses' : label}
              style={{
                width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? `color-mix(in srgb, ${color} 20%, transparent)` : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <Icon size={14} style={{ color: active ? color : 'var(--shell-ink-muted)' }} />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {BRANDS.map(({ id, label, icon: Icon, color }) => {
        const active = scope === id
        return (
          <button
            key={id}
            onClick={() => setScope(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
              borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
              background: active ? `color-mix(in srgb, ${color} 10%, var(--card-bg))` : 'var(--card-bg)',
              border: `1.5px solid ${active ? color : 'var(--card-border)'}`,
              boxShadow: active ? `0 0 0 3px color-mix(in srgb, ${color} 15%, transparent)` : 'var(--card-shadow)',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: `color-mix(in srgb, ${color} 15%, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={16} style={{ color }} />
            </div>
            <span className="font-display uppercase" style={{
              color: active ? color : 'var(--ink-muted)', fontSize: 13, letterSpacing: '0.05em',
            }}>
              {label}
            </span>
          </button>
        )
      })}
      <span style={{ fontSize: 11, color: 'var(--ink-disabled)', marginLeft: 4, fontStyle: 'italic' }}>
        {scope === 'all' ? 'Showing everything' : `Focused on ${BRANDS.find(b => b.id === scope)?.label}`}
      </span>
    </div>
  )
}

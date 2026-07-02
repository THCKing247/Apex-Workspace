'use client'

import Image from 'next/image'
import { useBrandScope, type BrandScope } from '@/lib/brand-scope-context'

// ─── Brand logo switcher ────────────────────────────────────────────────────
// Uses real logo files from /public/logos/.
// size="large" -> dashboard hero row with labels
// Both sizes read/write the SAME context — clicking updates everything instantly.

const BRANDS: Array<{ id: BrandScope; label: string; logo: string; color: string }> = [
  { id: 'all',        label: 'Apex TSG',   logo: '/logos/apex-logo.png',       color: 'var(--apex)'       },
  { id: 'buildvance', label: 'Buildvance', logo: '/logos/buildvance-logo.png', color: 'var(--buildvance)' },
  { id: 'braik',      label: 'Braik',      logo: '/logos/braik-logo.png',      color: 'var(--braik)'      },
]

export default function BrandLogoSwitcher({ size = 'large' }: { size?: 'large' }) {
  const { scope, setScope } = useBrandScope()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {BRANDS.map(({ id, label, logo, color }) => {
        const active = scope === id
        return (
          <button
            key={id}
            onClick={() => setScope(id)}
            title={id === 'all' ? 'Apex TSG — all businesses' : label}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
              transition: 'all 0.15s',
              background: active ? `color-mix(in srgb, ${color} 10%, var(--card-bg))` : 'var(--card-bg)',
              border: `1.5px solid ${active ? color : 'var(--card-border)'}`,
              boxShadow: active ? `0 0 0 3px color-mix(in srgb, ${color} 15%, transparent)` : 'var(--card-shadow)',
              opacity: active ? 1 : 0.6,
            }}
          >
            <Image
              src={logo}
              alt={label}
              width={110}
              height={34}
              style={{ objectFit: 'contain', objectPosition: 'center', maxHeight: 34 }}
            />
          </button>
        )
      })}
      <span style={{ fontSize: 11, color: 'var(--ink-disabled)', marginLeft: 4, fontStyle: 'italic' }}>
        {scope === 'all' ? 'Showing everything' : `Focused on ${BRANDS.find(b => b.id === scope)?.label}`}
      </span>
    </div>
  )
}

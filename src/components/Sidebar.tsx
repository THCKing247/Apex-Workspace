'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, ListChecks, Kanban, GitBranch, Target,
  Calendar, Mail, BarChart2, FileText, FolderOpen, Radar,
  Bot, Settings, Users, Trophy, ClipboardList, Megaphone,
  Search, LogOut, Mountain, FileBarChart2,
} from 'lucide-react'
import { useBrandScope, type BrandScope } from '@/lib/brand-scope-context'
import GlobalSearchOverlay from '@/components/GlobalSearchOverlay'
import { createClient } from '@/lib/supabase/client'

// ─── Sidebar IA — grouped by FUNCTION, not by brand ────────────────────────
// Brand no longer determines which section a tool lives in. Instead, the
// active brand scope (Apex/Buildvance/Braik) recolors the WHOLE sidebar at
// once — every icon, every active state, every section label shares one
// color that matches whatever lens is currently selected.

const sections = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard },
      { label: 'Action Needed', href: '/action-needed', icon: ListChecks      },
      { label: 'Reports',       href: '/reports',       icon: FileBarChart2   },
    ],
  },
  {
    label: 'PROSPECTS',
    items: [
      { label: 'Pipeline',      href: '/pipeline',      icon: Kanban  },
      { label: 'Braik Targets', href: '/braik-targets', icon: Target  },
    ],
  },
  {
    label: 'DELIVERY',
    items: [
      { label: 'Projects', href: '/projects',       icon: GitBranch     },
      { label: 'Clients',  href: '/clients',        icon: Users         },
      { label: 'Programs', href: '/braik-programs',  icon: Trophy        },
      { label: 'Playbook', href: '/braik-playbook',  icon: ClipboardList },
    ],
  },
  {
    label: 'GROWTH',
    items: [
      { label: 'Social',      href: '/social',         icon: BarChart2 },
      { label: 'Outreach',    href: '/braik-outreach',  icon: Megaphone },
      { label: 'Competitors', href: '/competitors',    icon: Radar     },
      { label: 'Resources',   href: '/resources',      icon: FolderOpen },
    ],
  },
  {
    label: 'COMMS',
    items: [
      { label: 'Calendar', href: '/calendar', icon: Calendar },
      { label: 'Inbox',    href: '/inbox',    icon: Mail     },
      { label: 'Notes',    href: '/notes',    icon: FileText },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'AI Assistant', href: '/assistant', icon: Bot      },
      { label: 'Settings',     href: '/settings',  icon: Settings },
    ],
  },
]

const SCOPE_COLOR: Record<BrandScope, string> = {
  all:        'var(--apex)',
  buildvance: 'var(--buildvance)',
  braik:      'var(--braik)',
}

const SCOPE_LOGO: Record<BrandScope, string> = {
  all:        '/logos/apex-mark.png',
  buildvance: '/logos/buildvance-mark.png',
  braik:      '/logos/braik-mark.png',
}

const SCOPE_FALLBACK_ICON: Record<BrandScope, React.ElementType> = {
  all: Mountain, buildvance: GitBranch, braik: Trophy,
}

// ─── Logo image with graceful icon fallback ─────────────────────────────────
// Drop real exported PNG/SVG logo marks at /public/logos/{apex,buildvance,braik}-mark.png
// and they'll render automatically. Until then, falls back to a styled icon.
function BrandMark({ scope, size = 14 }: { scope: BrandScope; size?: number }) {
  const [errored, setErrored] = useState(false)
  const Fallback = SCOPE_FALLBACK_ICON[scope]
  const color = SCOPE_COLOR[scope]
  if (errored) return <Fallback size={size} style={{ color }} />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SCOPE_LOGO[scope]}
      alt=""
      width={size} height={size}
      style={{ objectFit: 'contain', flexShrink: 0 }}
      onError={() => setErrored(true)}
    />
  )
}

function SidebarScopeQuickSelect() {
  const { scope, setScope } = useBrandScope()
  const options: Array<{ id: BrandScope; label: string }> = [
    { id: 'all', label: 'Apex — All' }, { id: 'buildvance', label: 'Buildvance' }, { id: 'braik', label: 'Braik' },
  ]
  return (
    <div className="px-3 py-2.5 border-b flex-shrink-0" style={{ borderColor: 'var(--shell-border)', position: 'relative', zIndex: 1 }}>
      <p className="font-display uppercase" style={{ color: 'var(--shell-ink-muted)', fontSize: 9, letterSpacing: '0.1em', marginBottom: 6, paddingLeft: 2 }}>Viewing</p>
      <div style={{ display: 'flex', gap: 4 }}>
        {options.map(({ id, label }) => {
          const active = scope === id
          const color = SCOPE_COLOR[id]
          return (
            <button key={id} onClick={() => setScope(id)} title={label} style={{
              flex: 1, height: 32, borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? `color-mix(in srgb, ${color} 18%, transparent)` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active ? color : 'transparent'}`, transition: 'all 0.15s',
            }}>
              <BrandMark scope={id} size={15} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { scope } = useBrandScope()
  const color = SCOPE_COLOR[scope]
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function open() { setSearchOpen(true) }
    window.addEventListener('open-search', open)
    return () => window.removeEventListener('open-search', open)
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <aside
        className="fixed top-0 left-0 h-screen flex flex-col border-r"
        style={{ width: 224, backgroundColor: 'var(--shell-bg)', borderColor: 'var(--shell-border)', zIndex: 40 }}
      >
        {/* Circuit overlay — tinted by scope color */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 224 900" preserveAspectRatio="xMidYMid slice">
            <path className="trace-animated-slow" d="M0,180 L80,180 L80,120 L224,120" fill="none" stroke={color} strokeWidth="1" opacity="0.15" />
            <path className="trace-animated" d="M0,420 L60,420 L60,360 L224,360" fill="none" stroke={color} strokeWidth="1" opacity="0.1" style={{ animationDelay: '1.5s' }} />
            <circle className="node-pulse" cx="80" cy="180" r="2.5" fill={color} opacity="0.5" />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--shell-border)', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BrandMark scope="all" size={22} />
          <span className="font-display" style={{ color: 'var(--apex)', fontSize: 18, letterSpacing: '0.1em' }}>APEX TSG</span>
        </div>

        <SidebarScopeQuickSelect />

        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, margin: '10px 12px 4px', padding: '7px 10px',
            borderRadius: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--shell-border)',
            cursor: 'pointer', position: 'relative', zIndex: 1,
          }}
        >
          <Search size={13} style={{ color: 'var(--shell-ink-muted)' }} />
          <span style={{ fontSize: 12, color: 'var(--shell-ink-muted)', flex: 1, textAlign: 'left' }}>Search…</span>
          <span style={{ fontSize: 9, color: 'var(--shell-ink-muted)', fontFamily: 'var(--font-mono)', border: '1px solid var(--shell-border)', borderRadius: 4, padding: '1px 5px' }}>⌘K</span>
        </button>

        {/* Nav — every item colored by SCOPE, not by fixed section brand */}
        <nav className="flex-1 overflow-y-auto py-2" style={{ position: 'relative', zIndex: 1 }}>
          {sections.map((section) => (
            <div key={section.label} className="mb-2">
              <div className="mx-2 mt-3 mb-1 px-2 py-1 rounded" style={{ borderLeft: `2px solid ${color}`, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                <span className="font-display uppercase" style={{ color, fontSize: 10, letterSpacing: '0.14em' }}>{section.label}</span>
              </div>
              {section.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link key={href} href={href} className="flex items-center gap-2.5 px-4 py-1.5 mx-2 my-0.5 rounded-md transition-all duration-150 font-display" style={{
                    color: active ? color : 'var(--shell-ink-dim)',
                    backgroundColor: active ? `color-mix(in srgb, ${color} 14%, transparent)` : 'transparent',
                    borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
                    fontSize: 13, letterSpacing: '0.02em',
                  }}>
                    <Icon size={14} style={{ color: active ? color : 'var(--shell-ink-muted)', flexShrink: 0 }} />
                    {label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Account — moved here since header is gone */}
        <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: 'var(--shell-border)', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, color: 'var(--shell-ink-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userEmail}
          </p>
          <button onClick={signOut} className="font-display uppercase" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 11, letterSpacing: '0.05em', padding: 0 }}>
            <LogOut size={11} /> Sign out
          </button>
        </div>
      </aside>

      <GlobalSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import {
  LayoutDashboard, ListChecks, Kanban, GitBranch,
  Target, Calendar, Mail, BarChart2, FileText,
  FolderOpen, Radar, Bot, Settings, Users, Trophy,
  ClipboardList, Megaphone, Mountain, FileBarChart2,
} from 'lucide-react'
import { useBrandScope, type BrandScope } from '@/lib/brand-scope-context'

// ─── Sidebar IA ───────────────────────────────────────────────────────────────
// TODAY       — daily-use tools for both brands
// BUILDVANCE  — client work, web dev, leads, projects
// BRAIK       — sports SaaS, schools, coaches
// SYSTEM      — AI, settings
// ─────────────────────────────────────────────────────────────────────────────

const sections = [
  {
    label: 'TODAY',
    brand: 'apex',
    items: [
      { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard },
      { label: 'Action Needed', href: '/action-needed', icon: ListChecks      },
      { label: 'Calendar',      href: '/calendar',      icon: Calendar        },
      { label: 'Inbox',         href: '/inbox',         icon: Mail            },
      { label: 'Reports',       href: '/reports',       icon: FileBarChart2   },
    ],
  },
  {
    label: 'BUILDVANCE',
    brand: 'buildvance',
    items: [
      { label: 'Pipeline',      href: '/pipeline',      icon: Kanban          },
      { label: 'Projects',      href: '/projects',      icon: GitBranch       },
      { label: 'Social',        href: '/social',        icon: BarChart2       },
      { label: 'Competitors',   href: '/competitors',   icon: Radar           },
      { label: 'Resources',     href: '/resources',     icon: FolderOpen      },
      { label: 'Notes',         href: '/notes',         icon: FileText        },
    ],
  },
  {
    label: 'BRAIK',
    brand: 'braik',
    items: [
      { label: 'Braik Targets', href: '/braik-targets', icon: Target          },
    ],
  },
  {
    label: 'SYSTEM',
    brand: 'apex',
    items: [
      { label: 'AI Assistant',  href: '/assistant',     icon: Bot             },
      { label: 'Settings',      href: '/settings',      icon: Settings        },
    ],
  },
]

const BRAND_COLOR: Record<string, string> = {
  buildvance: 'var(--buildvance)',
  braik:      'var(--braik)',
  apex:       'var(--apex)',
}

const SECTION_BORDER: Record<string, string> = {
  buildvance: 'rgba(0,201,122,0.15)',
  braik:      'rgba(255,122,51,0.15)',
  apex:       'rgba(91,155,255,0.15)',
}

const SCOPE_OPTIONS: Array<{ id: BrandScope; label: string; icon: React.ElementType; color: string }> = [
  { id: 'all',        label: 'Apex — All',  icon: Mountain,  color: 'var(--apex)'       },
  { id: 'buildvance', label: 'Buildvance',  icon: GitBranch, color: 'var(--buildvance)' },
  { id: 'braik',      label: 'Braik',       icon: Trophy,    color: 'var(--braik)'      },
]

// ─── Scope quick-select — same global scope as the top bar + dashboard.
// Clicking a brand instantly re-filters every scoped tool without leaving
// the current page.
function SidebarScopeQuickSelect() {
  const { scope, setScope } = useBrandScope()
  return (
    <div className="px-3 py-2.5 border-b flex-shrink-0" style={{ borderColor: 'var(--shell-border)', position: 'relative', zIndex: 1 }}>
      <p className="font-display uppercase" style={{ color: 'var(--shell-ink-muted)', fontSize: 9, letterSpacing: '0.1em', marginBottom: 6, paddingLeft: 2 }}>
        Viewing
      </p>
      <div style={{ display: 'flex', gap: 4 }}>
        {SCOPE_OPTIONS.map(({ id, label, icon: Icon, color }) => {
          const active = scope === id
          return (
            <button
              key={id}
              onClick={() => setScope(id)}
              title={label}
              style={{
                flex: 1, height: 30, borderRadius: 6, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? `color-mix(in srgb, ${color} 18%, transparent)` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? color : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={13} style={{ color: active ? color : 'var(--shell-ink-muted)' }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface SidebarProps {
  userEmail: string
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col border-r"
      style={{
        width: 224,
        backgroundColor: 'var(--shell-bg)',
        borderColor: 'var(--shell-border)',
        zIndex: 40,
      }}
    >
      {/* Circuit SVG overlay */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 224 900" preserveAspectRatio="xMidYMid slice">
          <path className="trace-animated-slow" d="M0,180 L80,180 L80,120 L224,120"
            fill="none" stroke="#5B9BFF" strokeWidth="1" opacity="0.15" style={{ animationDelay: '0s' }} />
          <path className="trace-animated" d="M0,420 L60,420 L60,360 L224,360"
            fill="none" stroke="#00C97A" strokeWidth="1" opacity="0.12" style={{ animationDelay: '1.5s' }} />
          <path className="trace-animated-med" d="M0,620 L100,620 L100,560 L224,560"
            fill="none" stroke="#FF7A33" strokeWidth="1" opacity="0.13" style={{ animationDelay: '0.8s' }} />
          <circle className="node-pulse"      cx="80"  cy="180" r="2.5" fill="#5B9BFF" opacity="0.5" />
          <circle className="node-pulse-slow" cx="60"  cy="420" r="2.5" fill="#00C97A" opacity="0.5" style={{ animationDelay: '1s' }} />
          <circle className="node-pulse"      cx="100" cy="620" r="2.5" fill="#FF7A33" opacity="0.55" style={{ animationDelay: '0.5s' }} />
        </svg>
      </div>

      {/* Logo */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--shell-border)', position: 'relative', zIndex: 1 }}>
        <Image
          src="/logos/apex-logo.png"
          alt="Apex Technical Solutions Group"
          width={130}
          height={38}
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
          priority
        />
      </div>

      <SidebarScopeQuickSelect />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ position: 'relative', zIndex: 1 }}>
        {sections.map((section) => {
          const sectionColor = BRAND_COLOR[section.brand]
          return (
            <div key={section.label} className="mb-2">
              <div
                className="mx-2 mt-3 mb-1 px-2 py-1 rounded"
                style={{
                  borderLeft: `2px solid ${sectionColor}`,
                  backgroundColor: SECTION_BORDER[section.brand],
                }}
              >
                <span
                  className="font-display uppercase"
                  style={{ color: sectionColor, fontSize: 10, letterSpacing: '0.14em' }}
                >
                  {section.label}
                </span>
              </div>

              {section.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-4 py-1.5 mx-2 my-0.5 rounded-md transition-all duration-150 font-display"
                    style={{
                      color: active ? sectionColor : 'var(--shell-ink-dim)',
                      backgroundColor: active
                        ? `color-mix(in srgb, ${sectionColor} 14%, transparent)`
                        : 'transparent',
                      borderLeft: active ? `2px solid ${sectionColor}` : '2px solid transparent',
                      fontSize: 13,
                      letterSpacing: '0.02em',
                    }}
                  >
                    <Icon size={14} style={{ color: active ? sectionColor : 'var(--shell-ink-muted)', flexShrink: 0 }} />
                    {label}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Bottom footer */}
      <div
        className="flex-shrink-0 border-t px-4 pt-3 pb-4"
        style={{ borderColor: 'var(--shell-border)', position: 'relative', zIndex: 1 }}
      >
        <span
          className="block truncate mb-2"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#d946ef',
            maxWidth: 192,
          }}
        >
          {userEmail}
        </span>
        <LogoutButton />
      </div>
    </aside>
  )
}

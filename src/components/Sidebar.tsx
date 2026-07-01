'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ListChecks,
  Kanban,
  GitBranch,
  Target,
  Calendar,
  Mail,
  BarChart2,
  FileText,
  FolderOpen,
  Radar,
  Bot,
  Settings,
} from 'lucide-react'

const sections = [
  {
    label: 'TODAY',
    items: [
      { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard, brand: 'apex'        },
      { label: 'Action Needed', href: '/action-needed', icon: ListChecks,      brand: 'braik'       },
      { label: 'Pipeline',      href: '/pipeline',      icon: Kanban,          brand: 'buildvance'  },
      { label: 'Calendar',      href: '/calendar',      icon: Calendar,        brand: 'apex'        },
      { label: 'Inbox',         href: '/inbox',         icon: Mail,            brand: 'apex'        },
    ],
  },
  {
    label: 'WORK',
    items: [
      { label: 'Projects',      href: '/projects',      icon: GitBranch,       brand: 'buildvance'  },
      { label: 'Braik Targets', href: '/braik-targets', icon: Target,          brand: 'braik'       },
      { label: 'Notes',         href: '/notes',         icon: FileText,        brand: 'apex'        },
    ],
  },
  {
    label: 'GROWTH',
    items: [
      { label: 'Social',        href: '/social',        icon: BarChart2,       brand: 'apex'        },
      { label: 'Competitors',   href: '/competitors',   icon: Radar,           brand: 'apex'        },
      { label: 'Resources',     href: '/resources',     icon: FolderOpen,      brand: 'apex'        },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'AI Assistant',  href: '/assistant',     icon: Bot,             brand: 'apex'        },
      { label: 'Settings',      href: '/settings',      icon: Settings,        brand: 'apex'        },
    ],
  },
]

const BRAND_COLOR: Record<string, string> = {
  buildvance: 'var(--buildvance)',
  braik:      'var(--braik)',
  apex:       'var(--apex)',
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col border-r circuit-bg"
      style={{
        width: 224,
        backgroundColor: 'var(--shell-bg)',
        borderColor: 'var(--shell-border)',
      }}
    >
      {/* Circuit overlay lives inside the sidebar shell */}
      <div className="circuit-overlay" aria-hidden="true">
        <svg
          width="100%" height="100%"
          viewBox="0 0 224 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0 }}
        >
          <path className="trace-animated-slow" d="M0,180 L80,180 L80,120 L224,120"
            fill="none" stroke="#5B9BFF" strokeWidth="1" opacity="0.15" style={{ animationDelay: '0s' }} />
          <path className="trace-animated" d="M0,380 L60,380 L60,320 L224,320"
            fill="none" stroke="#5B9BFF" strokeWidth="1" opacity="0.12" style={{ animationDelay: '1.5s' }} />
          <path className="trace-animated-med" d="M0,560 L100,560 L100,500 L224,500"
            fill="none" stroke="#FF7A33" strokeWidth="1" opacity="0.13" style={{ animationDelay: '0.8s' }} />
          <path className="trace-animated-slow" d="M0,720 L70,720 L70,680 L224,680"
            fill="none" stroke="#00C97A" strokeWidth="1" opacity="0.12" style={{ animationDelay: '2s' }} />
          <circle className="node-pulse"      cx="80"  cy="180" r="2.5" fill="#5B9BFF" opacity="0.5"  />
          <circle className="node-pulse-slow" cx="60"  cy="380" r="2.5" fill="#5B9BFF" opacity="0.4"  style={{ animationDelay: '1s'   }} />
          <circle className="node-pulse"      cx="100" cy="560" r="2.5" fill="#FF7A33" opacity="0.55" style={{ animationDelay: '0.5s' }} />
          <circle className="node-pulse-slow" cx="70"  cy="720" r="2.5" fill="#00C97A" opacity="0.5"  style={{ animationDelay: '2s'   }} />
        </svg>
      </div>

      {/* Wordmark */}
      <div
        className="px-4 py-4 border-b flex-shrink-0 flex items-center"
        style={{ borderColor: 'var(--shell-border)', position: 'relative', zIndex: 1 }}
      >
        <Image
          src="/logos/apex-logo.png"
          alt="Apex Technical Solutions Group"
          width={148}
          height={44}
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
          priority
        />
      </div>

      {/* Nav sections */}
      <nav className="flex-1 py-2 overflow-y-auto" style={{ position: 'relative', zIndex: 1 }}>
        {sections.map((section) => (
          <div key={section.label} className="mb-1">
            <p
              className="px-4 pt-4 pb-1 text-xs font-display tracking-widest"
              style={{ color: 'var(--shell-ink-muted)', letterSpacing: '0.12em', fontSize: 10 }}
            >
              {section.label}
            </p>
            {section.items.map(({ label, href, icon: Icon, brand }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              const color = BRAND_COLOR[brand]
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-4 py-2 mx-2 my-0.5 rounded-md text-sm transition-all duration-150 font-display"
                  style={{
                    color: active ? color : 'var(--shell-ink-dim)',
                    backgroundColor: active ? `color-mix(in srgb, ${color} 12%, transparent)` : 'transparent',
                    borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
                    letterSpacing: '0.03em',
                    fontSize: 13,
                  }}
                >
                  <Icon
                    size={15}
                    style={{ color: active ? color : 'var(--shell-ink-muted)', flexShrink: 0 }}
                  />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}

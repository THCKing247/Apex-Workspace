'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
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
  FileBarChart2,
} from 'lucide-react'

const sections = [
  {
    label: 'TODAY',
    items: [
      { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard, brand: 'apex'        },
      { label: 'Action Needed', href: '/action-needed', icon: ListChecks,      brand: 'braik'       },
      { label: 'Reports',       href: '/reports',       icon: FileBarChart2,   brand: 'apex'        },
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
      }}
    >
      {/* Logo at top */}
      <div
        className="flex-shrink-0 px-4 pt-4 pb-3 border-b"
        style={{ borderColor: 'var(--shell-border)' }}
      >
        <Image
          src="/logos/apex-logo.png"
          alt="Apex Technical Solutions Group"
          width={130}
          height={38}
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
          priority
        />
      </div>

      {/* Nav sections */}
      <nav className="flex-1 pt-1 pb-2 overflow-y-auto">
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
                  className={`sidebar-nav-link flex items-center gap-2.5 px-4 py-2 mx-2 my-0.5 rounded-md text-sm font-display${active ? ' is-active' : ''}`}
                  style={{
                    '--link-color': color,
                    color: active ? color : 'var(--shell-ink-dim)',
                    backgroundColor: active ? `color-mix(in srgb, ${color} 12%, transparent)` : '',
                    borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
                    letterSpacing: '0.03em',
                    fontSize: 13,
                  } as React.CSSProperties}
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

      {/* Bottom footer — profile + sign out */}
      <div
        className="flex-shrink-0 border-t px-4 pt-3 pb-4"
        style={{ borderColor: 'var(--shell-border)' }}
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

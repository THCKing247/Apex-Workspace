'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
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
  LucideIcon,
} from 'lucide-react'

export interface SidebarNavItem {
  nav_key: string
  label: string
  sort_order: number
  visible: boolean
  accent_color: 'apex' | 'buildvance' | 'braik'
}

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  pipeline: Kanban,
  projects: GitBranch,
  'braik-targets': Target,
  calendar: Calendar,
  inbox: Mail,
  social: BarChart2,
  notes: FileText,
  resources: FolderOpen,
  competitors: Radar,
  assistant: Bot,
  settings: Settings,
}

const ACCENT_COLOR: Record<string, string> = {
  apex: '#5B9BFF',
  buildvance: '#00E08A',
  braik: '#FF7A33',
}

const ACCENT_DIM: Record<string, string> = {
  apex: 'rgba(91,155,255,0.1)',
  buildvance: 'rgba(0,224,138,0.1)',
  braik: 'rgba(255,122,51,0.1)',
}

// Fallback used when sidebar_config table doesn't exist yet
const FALLBACK_NAV: SidebarNavItem[] = [
  { nav_key: 'dashboard', label: 'Dashboard', sort_order: 1, visible: true, accent_color: 'apex' },
  { nav_key: 'pipeline', label: 'Pipeline', sort_order: 2, visible: true, accent_color: 'buildvance' },
  { nav_key: 'projects', label: 'Projects', sort_order: 3, visible: true, accent_color: 'apex' },
  { nav_key: 'braik-targets', label: 'Braik Targets', sort_order: 4, visible: true, accent_color: 'braik' },
  { nav_key: 'calendar', label: 'Calendar', sort_order: 5, visible: true, accent_color: 'apex' },
  { nav_key: 'inbox', label: 'Inbox', sort_order: 6, visible: true, accent_color: 'apex' },
  { nav_key: 'social', label: 'Social', sort_order: 7, visible: true, accent_color: 'apex' },
  { nav_key: 'notes', label: 'Notes', sort_order: 8, visible: true, accent_color: 'apex' },
  { nav_key: 'resources', label: 'Resources', sort_order: 9, visible: true, accent_color: 'apex' },
  { nav_key: 'competitors', label: 'Competitors', sort_order: 10, visible: true, accent_color: 'apex' },
  { nav_key: 'assistant', label: 'AI Assistant', sort_order: 11, visible: true, accent_color: 'apex' },
  { nav_key: 'settings', label: 'Settings', sort_order: 12, visible: true, accent_color: 'apex' },
]

interface SidebarProps {
  navItems?: SidebarNavItem[]
}

export default function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname()
  const items = (navItems ?? FALLBACK_NAV).filter((i) => i.visible)

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col border-r"
      style={{
        width: 220,
        backgroundColor: '#16265a',
        borderColor: 'rgba(91,155,255,0.22)',
      }}
    >
      <div
        className="px-4 py-5 border-b"
        style={{ borderColor: 'rgba(91,155,255,0.22)' }}
      >
        <span
          className="text-xl uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-teko)', color: '#f4f8ff', letterSpacing: '0.08em' }}
        >
          APEX TSG
        </span>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {items.map(({ nav_key, label, accent_color }) => {
          const href = `/${nav_key}`
          const active = pathname === href || pathname.startsWith(href + '/')
          const color = ACCENT_COLOR[accent_color] ?? '#5B9BFF'
          const dim = ACCENT_DIM[accent_color] ?? 'rgba(91,155,255,0.1)'
          const Icon = ICON_MAP[nav_key] ?? LayoutDashboard

          return (
            <Link
              key={nav_key}
              href={href}
              className="flex items-center gap-2.5 px-4 py-2 mx-2 my-0.5 rounded transition-colors"
              style={{
                fontFamily: 'var(--font-teko)',
                fontSize: '1rem',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: active ? color : '#7d9cd9',
                backgroundColor: active ? dim : 'transparent',
                borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'rgba(16,32,74,0.5)'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Icon
                size={14}
                style={{ color: active ? color : '#5f73a3', flexShrink: 0 }}
              />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

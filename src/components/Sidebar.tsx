'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Kanban,
  GitBranch,
  Mail,
  BarChart2,
  Bot,
  Settings,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Pipeline', href: '/pipeline', icon: Kanban },
  { label: 'Projects', href: '/projects', icon: GitBranch },
  { label: 'Inbox', href: '/inbox', icon: Mail },
  { label: 'Social', href: '/social', icon: BarChart2 },
  { label: 'AI Assistant', href: '/assistant', icon: Bot },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col border-r"
      style={{ width: 220, backgroundColor: '#0f1117', borderColor: '#1e2330' }}
    >
      <div
        className="px-4 py-5 border-b"
        style={{ borderColor: '#1e2330' }}
      >
        <span
          className="text-sm font-bold text-white tracking-wide"
          style={{ fontFamily: 'monospace' }}
        >
          APEX TSG
        </span>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-4 py-2 mx-2 my-0.5 rounded text-xs transition-colors"
              style={{
                fontFamily: 'monospace',
                color: active ? '#3B82F6' : '#9ca3af',
                backgroundColor: active ? '#1e2330' : 'transparent',
                borderLeft: active ? '2px solid #3B82F6' : '2px solid transparent',
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

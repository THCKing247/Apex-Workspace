import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar, { type SidebarNavItem } from '@/components/Sidebar'
import LogoutButton from '@/components/LogoutButton'

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch sidebar config — falls back gracefully if the table doesn't exist yet
  let navItems: SidebarNavItem[] | undefined
  try {
    const { data } = await supabase
      .from('sidebar_config')
      .select('nav_key, label, sort_order, visible, accent_color')
      .order('sort_order', { ascending: true })
    if (data && data.length > 0) {
      navItems = data as SidebarNavItem[]
    }
  } catch {
    // Table not yet created — Sidebar will use its built-in fallback
  }

  return (
    <div className="flex min-h-screen circuit-bg" style={{ backgroundColor: '#0d1b3d' }}>
      <Sidebar navItems={navItems} />

      <div className="flex-1" style={{ marginLeft: 220 }}>
        <header
          className="flex items-center justify-between px-6 py-3 border-b sticky top-0 z-10 backdrop-blur"
          style={{
            backgroundColor: 'rgba(22,38,90,0.8)',
            borderColor: 'rgba(91,155,255,0.22)',
          }}
        >
          <span
            className="text-base font-semibold uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-teko)', color: '#f4f8ff', letterSpacing: '0.08em' }}
          >
            Apex Workspace
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: '#7d9cd9' }}>
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

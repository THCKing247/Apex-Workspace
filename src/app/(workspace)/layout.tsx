import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
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

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#13161f' }}>
      <Sidebar />

      <div className="flex-1" style={{ marginLeft: 220 }}>
        <header
          className="flex items-center justify-between px-6 py-3 border-b sticky top-0 z-10"
          style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
        >
          <span
            className="text-sm font-semibold text-white"
            style={{ fontFamily: 'monospace' }}
          >
            Apex Workspace
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: '#6b7280' }}>
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

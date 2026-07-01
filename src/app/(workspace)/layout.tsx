import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import CircuitBackground from '@/components/CircuitBackground'
import LogoutButton from '@/components/LogoutButton'
import { AssistantProvider } from '@/lib/assistant-context'
import PageContextTracker from '@/components/PageContextTracker'
import AssistantTrigger from '@/components/AssistantTrigger'
import AssistantPanelLoader from '@/components/AssistantPanelLoader'

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
    <AssistantProvider>
      <PageContextTracker />
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--body-bg)' }}>
        <Sidebar />

        <div className="flex-1" style={{ marginLeft: 224 }}>
          {/* Top bar — dark shell strip */}
          <header
            className="flex items-center justify-between px-6 py-3 border-b sticky top-0 z-10"
            style={{
              backgroundColor: 'var(--shell-bg)',
              borderColor: 'var(--shell-border)',
            }}
          >
            <div>
              <span
                className="font-display tracking-widest"
                style={{ color: 'var(--apex)', fontSize: 13, letterSpacing: '0.08em' }}
              >
                APEX WORKSPACE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: 'var(--shell-ink-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                {user.email}
              </span>
              <LogoutButton />
            </div>
          </header>

          {/* Main content area — eggshell body with circuit overlay */}
          <main
            className="circuit-bg relative min-h-[calc(100vh-49px)]"
            style={{ backgroundColor: 'var(--body-bg)' }}
          >
            <CircuitBackground />
            <div className="relative z-10 p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Floating assistant trigger + lazy-loaded panel — always mounted, never reflowing page */}
      <AssistantTrigger />
      <AssistantPanelLoader />
    </AssistantProvider>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import CircuitBackground from '@/components/CircuitBackground'
import WorkspaceShell from '@/components/WorkspaceShell'
import BrandLogoSwitcher from '@/components/BrandLogoSwitcher'
import { AssistantProvider } from '@/lib/assistant-context'
import { BrandScopeProvider } from '@/lib/brand-scope-context'
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
    <BrandScopeProvider>
      <AssistantProvider>
        <PageContextTracker />
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--body-bg)' }}>
          <Sidebar userEmail={user.email ?? ''} />

          <WorkspaceShell>
            {/* Top bar — dark shell strip with brand scope switcher */}
            <header
              className="flex items-center justify-between px-6 py-3 border-b sticky top-0 z-10"
              style={{
                backgroundColor: 'var(--shell-bg)',
                borderColor: 'var(--shell-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span
                  className="font-display tracking-widest"
                  style={{ color: 'var(--apex)', fontSize: 13, letterSpacing: '0.08em' }}
                >
                  APEX WORKSPACE
                </span>
                <BrandLogoSwitcher size="compact" />
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--shell-ink-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  {user.email}
                </span>
              </div>
            </header>

            {/* Main content area */}
            <main
              className="circuit-bg relative min-h-screen"
              style={{ backgroundColor: 'var(--body-bg)' }}
            >
              <CircuitBackground />
              <div className="relative z-10 pt-6 pr-6 pb-6 pl-4">
                {children}
              </div>
            </main>
          </WorkspaceShell>
        </div>

        {/* Floating assistant trigger + lazy-loaded panel */}
        <AssistantTrigger />
        <AssistantPanelLoader />
      </AssistantProvider>
    </BrandScopeProvider>
  )
}

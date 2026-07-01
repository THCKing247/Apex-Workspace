import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import CircuitBackground from '@/components/CircuitBackground'
import WorkspaceShell from '@/components/WorkspaceShell'
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
        <Sidebar userEmail={user.email ?? ''} />

        <WorkspaceShell>
          {/* Main content area — eggshell body with circuit overlay */}
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

      {/* Floating assistant trigger + lazy-loaded panel — always mounted, never reflowing page */}
      <AssistantTrigger />
      <AssistantPanelLoader />
    </AssistantProvider>
  )
}

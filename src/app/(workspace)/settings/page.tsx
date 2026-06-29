import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import {
  GitBranch,
  Globe,
  Mail,
  Search,
  Bot,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export const metadata = { title: 'Settings — Apex Workspace' }

interface Integration {
  name: string
  icon: React.ReactNode
  envVar: string
  configured: boolean
}

function IntegrationRow({ name, icon, envVar, configured }: Integration) {
  return (
    <div
      className="flex items-center gap-4 py-3 border-b last:border-0"
      style={{ borderColor: '#1e2330' }}
    >
      <div style={{ color: '#6b7280' }}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{name}</p>
        <code className="text-xs" style={{ color: '#4b5563' }}>{envVar}</code>
      </div>
      <div className="flex items-center gap-1.5">
        {configured ? (
          <>
            <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
            <span className="text-xs" style={{ color: '#22c55e' }}>Connected</span>
          </>
        ) : (
          <>
            <AlertCircle size={14} style={{ color: '#f59e0b' }} />
            <span className="text-xs" style={{ color: '#f59e0b' }}>Not configured</span>
          </>
        )}
      </div>
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const integrations: Integration[] = [
    {
      name: 'Supabase',
      icon: <Globe size={16} />,
      envVar: 'NEXT_PUBLIC_SUPABASE_URL',
      configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
    {
      name: 'GitHub',
      icon: <GitBranch size={16} />,
      envVar: 'GITHUB_TOKEN',
      configured: !!process.env.GITHUB_TOKEN,
    },
    {
      name: 'Meta (Facebook)',
      icon: <Globe size={16} />,
      envVar: 'META_ACCESS_TOKEN',
      configured: !!process.env.META_ACCESS_TOKEN,
    },
    {
      name: 'Gmail',
      icon: <Mail size={16} />,
      envVar: 'GOOGLE_REFRESH_TOKEN',
      configured: !!process.env.GOOGLE_REFRESH_TOKEN,
    },
    {
      name: 'Hunter.io',
      icon: <Search size={16} />,
      envVar: 'HUNTER_API_KEY',
      configured: !!process.env.HUNTER_API_KEY,
    },
    {
      name: 'Anthropic (Claude)',
      icon: <Bot size={16} />,
      envVar: 'ANTHROPIC_API_KEY',
      configured: !!process.env.ANTHROPIC_API_KEY,
    },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'monospace' }}>Settings</h1>
        <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Manage integrations and account</p>
      </div>

      <div
        className="rounded-lg border p-5"
        style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
      >
        <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'monospace' }}>
          Connected Integrations
        </h2>
        <div>
          {integrations.map((integration) => (
            <IntegrationRow key={integration.name} {...integration} />
          ))}
        </div>
        <p className="text-xs mt-4" style={{ color: '#4b5563' }}>
          Configure integrations by adding the corresponding environment variables to{' '}
          <code style={{ color: '#6b7280' }}>.env.local</code> and restarting the dev server.
        </p>
      </div>

      <div
        className="rounded-lg border p-5"
        style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
      >
        <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'monospace' }}>
          Account
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">{user?.email}</p>
            <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Apex TSG Workspace</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

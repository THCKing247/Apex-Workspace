import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import SidebarCustomizer from './SidebarCustomizer'
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
export const dynamic = 'force-dynamic'

const apexCard = {
  background: 'linear-gradient(180deg,#16265a 0%,#10204a 100%)',
  border: '1px solid rgba(91,155,255,0.3)',
  borderRadius: 8,
} as const

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
      style={{ borderColor: 'rgba(91,155,255,0.12)' }}
    >
      <div style={{ color: '#5f73a3' }}>{icon}</div>
      <div className="flex-1">
        <p
          className="uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-teko)', fontSize: 15, color: '#f4f8ff' }}
        >
          {name}
        </p>
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3d4f87' }}>{envVar}</code>
      </div>
      <div className="flex items-center gap-1.5">
        {configured ? (
          <>
            <CheckCircle2 size={14} style={{ color: '#00E08A' }} />
            <span
              className="uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#00E08A' }}
            >
              Connected
            </span>
          </>
        ) : (
          <>
            <AlertCircle size={14} style={{ color: '#FF7A33' }} />
            <span
              className="uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#FF7A33' }}
            >
              Not configured
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // Load sidebar config for customizer (gracefully handles missing table)
  let sidebarItems: {
    nav_key: string
    label: string
    sort_order: number
    visible: boolean
    accent_color: 'apex' | 'buildvance' | 'braik'
  }[] = []
  try {
    const { data } = await supabase
      .from('sidebar_config')
      .select('nav_key, label, sort_order, visible, accent_color')
      .order('sort_order', { ascending: true })
    if (data) sidebarItems = data as typeof sidebarItems
  } catch {
    // Table not yet created
  }

  const sidebarConfigured = sidebarItems.length > 0

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p
          className="uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-teko)', fontSize: 11, color: '#5f73a3', letterSpacing: '0.05em' }}
        >
          APEX — CONFIG
        </p>
        <h1
          className="font-semibold uppercase"
          style={{ fontFamily: 'var(--font-teko)', fontSize: '2rem', color: '#f4f8ff', lineHeight: 1 }}
        >
          Settings
        </h1>
      </div>

      {/* Sidebar customizer */}
      <div className="card-depth p-5 space-y-4" style={apexCard}>
        <h2
          className="uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-teko)', fontSize: 15, color: '#7d9cd9', letterSpacing: '0.05em' }}
        >
          Customize sidebar
        </h2>
        {sidebarConfigured ? (
          <SidebarCustomizer initialItems={sidebarItems} />
        ) : (
          <div className="py-4 space-y-2">
            <p className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: '#7d9cd9' }}>
              Run the following SQL in your Supabase SQL editor to enable sidebar customization:
            </p>
            <pre
              className="p-3 rounded text-xs overflow-x-auto"
              style={{
                backgroundColor: '#0d1b3d',
                border: '1px solid rgba(91,155,255,0.2)',
                color: '#5f73a3',
                fontFamily: 'var(--font-mono)',
              }}
            >{`create table sidebar_config (
  id uuid default gen_random_uuid() primary key,
  nav_key text not null unique,
  label text not null,
  sort_order int not null,
  visible boolean default true,
  accent_color text default 'apex' check (accent_color in ('apex','buildvance','braik')),
  updated_at timestamp with time zone default now()
);

alter table sidebar_config enable row level security;
create policy "auth full access" on sidebar_config for all using (auth.role() = 'authenticated');

insert into sidebar_config (nav_key, label, sort_order, accent_color) values
  ('dashboard', 'Dashboard', 1, 'apex'),
  ('pipeline', 'Pipeline', 2, 'buildvance'),
  ('projects', 'Projects', 3, 'apex'),
  ('braik-targets', 'Braik Targets', 4, 'braik'),
  ('calendar', 'Calendar', 5, 'apex'),
  ('inbox', 'Inbox', 6, 'apex'),
  ('social', 'Social', 7, 'apex'),
  ('notes', 'Notes', 8, 'apex'),
  ('resources', 'Resources', 9, 'apex'),
  ('competitors', 'Competitors', 10, 'apex'),
  ('assistant', 'AI Assistant', 11, 'apex'),
  ('settings', 'Settings', 12, 'apex');`}</pre>
          </div>
        )}
      </div>

      {/* Connected integrations */}
      <div className="card-depth p-5" style={apexCard}>
        <h2
          className="uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-teko)', fontSize: 15, color: '#7d9cd9', letterSpacing: '0.05em' }}
        >
          Connected integrations
        </h2>
        <div>
          {integrations.map((integration) => (
            <IntegrationRow key={integration.name} {...integration} />
          ))}
        </div>
        <p className="text-xs mt-4" style={{ fontFamily: 'var(--font-inter)', color: '#3d4f87' }}>
          Configure integrations by adding env vars to{' '}
          <code style={{ fontFamily: 'var(--font-mono)', color: '#5f73a3' }}>.env.local</code>{' '}
          and restarting the dev server.
        </p>
      </div>

      {/* Account */}
      <div className="card-depth p-5" style={apexCard}>
        <h2
          className="uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-teko)', fontSize: 15, color: '#7d9cd9', letterSpacing: '0.05em' }}
        >
          Account
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p
              className="uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-teko)', fontSize: 16, color: '#f4f8ff' }}
            >
              {user?.email}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ fontFamily: 'var(--font-inter)', color: '#5f73a3' }}
            >
              Apex TSG Workspace
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

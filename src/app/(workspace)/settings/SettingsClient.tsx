'use client'

import { useState, type ElementType } from 'react'
import {
  Plug, LayoutDashboard, Bell, Building2, Users,
  Palette, Database, CheckCircle2, AlertCircle,
  GitBranch, Globe, Mail, Search, Bot, Calendar,
  ChevronRight, Save,
  Sun, Moon, Plus, Trash2, Download,
} from 'lucide-react'
import SidebarCustomizer from './SidebarCustomizer'

// ─── Types ────────────────────────────────────────────────────────────────────
type AccentColor = 'apex' | 'buildvance' | 'braik'

interface SidebarItem {
  nav_key:      string
  label:        string
  sort_order:   number
  visible:      boolean
  accent_color: AccentColor
}

interface Integration {
  id:         string
  name:       string
  icon:       ElementType
  envVar:     string
  configured: boolean
  tools:      string[]
  setupUrl:   string
  setupNote:  string
  category:   'data' | 'comms' | 'ai' | 'social' | 'prospecting'
}

interface Props {
  user:         { email: string | undefined }
  envFlags:     Record<string, boolean>
  sidebarItems: SidebarItem[]
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND: Record<string, string> = {
  buildvance: 'var(--buildvance)',
  braik:      'var(--braik)',
  apex:       'var(--apex)',
}

// ─── Integration catalogue ────────────────────────────────────────────────────
function makeIntegrations(flags: Record<string, boolean>): Integration[] {
  return [
    {
      id: 'supabase', name: 'Supabase', icon: Database,
      envVar: 'NEXT_PUBLIC_SUPABASE_URL', configured: flags.supabase,
      tools: ['All modules — primary database'],
      category: 'data',
      setupUrl: 'https://supabase.com/dashboard',
      setupNote: 'Get your project URL and anon key from Supabase → Settings → API.',
    },
    {
      id: 'github', name: 'GitHub', icon: GitBranch,
      envVar: 'GITHUB_TOKEN', configured: flags.github,
      tools: ['Projects → commit history, open PRs, issues', 'Dashboard → Commits 7d KPI'],
      category: 'data',
      setupUrl: 'https://github.com/settings/tokens',
      setupNote: 'Create a fine-grained personal access token with repo:read scope.',
    },
    {
      id: 'anthropic', name: 'Anthropic (Claude)', icon: Bot,
      envVar: 'ANTHROPIC_API_KEY', configured: flags.anthropic,
      tools: ['AI Assistant widget', 'Reports → AI narrative', 'Social → AI suggestions'],
      category: 'ai',
      setupUrl: 'https://console.anthropic.com',
      setupNote: 'Get your API key from the Anthropic console. Usage is pay-per-token (~$5–15/mo typical).',
    },
    {
      id: 'meta', name: 'Meta (Facebook)', icon: Globe,
      envVar: 'META_ACCESS_TOKEN', configured: flags.meta,
      tools: ['Social → page analytics, post engagement', 'Dashboard → Social Reach KPI'],
      category: 'social',
      setupUrl: 'https://business.facebook.com',
      setupNote: 'Generate a page access token via Meta Business Suite → System Users.',
    },
    {
      id: 'gmail', name: 'Gmail', icon: Mail,
      envVar: 'GOOGLE_REFRESH_TOKEN', configured: flags.gmail,
      tools: ['Inbox → read and filter emails', 'Dashboard → Unread KPI'],
      category: 'comms',
      setupUrl: 'https://developers.google.com/oauthplayground',
      setupNote: 'Use Google OAuth Playground with Gmail readonly scope to get a refresh token.',
    },
    {
      id: 'gcal', name: 'Google Calendar', icon: Calendar,
      envVar: 'GOOGLE_CLIENT_ID', configured: flags.gcal,
      tools: ['Calendar → two-way event sync', 'Dashboard → Upcoming events'],
      category: 'comms',
      setupUrl: 'https://console.cloud.google.com',
      setupNote: 'Create OAuth 2.0 credentials in Google Cloud Console.',
    },
    {
      id: 'hunter', name: 'Hunter.io', icon: Search,
      envVar: 'HUNTER_API_KEY', configured: flags.hunter,
      tools: ['Pipeline → Prospect panel (domain search, email verify)', 'Reports → API Intelligence'],
      category: 'prospecting',
      setupUrl: 'https://hunter.io/api-keys',
      setupNote: 'Free tier gives 25 searches/month. Paid plans start at $49/mo for 500 searches.',
    },
  ]
}

const CATEGORY_LABELS: Record<string, string> = {
  data:         'Data & Storage',
  comms:        'Communications',
  ai:           'AI & Automation',
  social:       'Social Media',
  prospecting:  'Lead Generation',
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'integrations',  label: 'Integrations',    icon: Plug            },
  { id: 'workspace',     label: 'Workspace',        icon: LayoutDashboard },
  { id: 'notifications', label: 'Notifications',    icon: Bell            },
  { id: 'business',      label: 'Business Profile', icon: Building2       },
  { id: 'team',          label: 'Team',             icon: Users           },
  { id: 'appearance',    label: 'Appearance',       icon: Palette         },
  { id: 'data',          label: 'Data & Export',    icon: Database        },
]

// ─── Reusable toggle ──────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
        background: on ? 'var(--apex)' : 'var(--card-border)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        left: on ? 21 : 3,
      }} />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATIONS TAB
// ─────────────────────────────────────────────────────────────────────────────
function IntegrationsTab({ integrations }: { integrations: Integration[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const categories = [...new Set(integrations.map(i => i.category))]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display" style={{ fontSize: 22, color: 'var(--ink-primary)', letterSpacing: '0.03em' }}>
          CONNECTED INTEGRATIONS
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
          Each integration unlocks specific tools in the workspace. Add env vars to{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--apex)' }}>.env.local</code>{' '}
          and redeploy.
        </p>
      </div>

      {/* Status summary */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { label: 'Connected',      count: integrations.filter(i => i.configured).length,  color: 'var(--buildvance)' },
          { label: 'Not configured', count: integrations.filter(i => !i.configured).length, color: 'var(--braik)'      },
          { label: 'Total',          count: integrations.length,                             color: 'var(--apex)'       },
        ].map(({ label, count, color }) => (
          <div key={label} className="card" style={{ padding: '10px 16px', flex: 1, textAlign: 'center' }}>
            <p className="font-display" style={{ color, fontSize: 24 }}>{count}</p>
            <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.1em', marginBottom: 8 }}>
            {CATEGORY_LABELS[cat]}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {integrations.filter(i => i.category === cat).map(integration => {
              const Icon = integration.icon
              const isExpanded = expanded === integration.id
              return (
                <div key={integration.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : integration.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: integration.configured ? 'rgba(0,201,122,0.1)' : 'rgba(139,146,170,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} style={{ color: integration.configured ? 'var(--buildvance)' : 'var(--ink-muted)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="font-display" style={{ color: 'var(--ink-primary)', fontSize: 14, letterSpacing: '0.02em' }}>
                        {integration.name}
                      </p>
                      <code style={{ fontSize: 10, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                        {integration.envVar}
                      </code>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {integration.configured ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--buildvance)', fontSize: 11, fontFamily: 'var(--font-display)' }}>
                          <CheckCircle2 size={12} /> CONNECTED
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--braik)', fontSize: 11, fontFamily: 'var(--font-display)' }}>
                          <AlertCircle size={12} /> NOT CONFIGURED
                        </span>
                      )}
                      <ChevronRight size={14} style={{ color: 'var(--ink-muted)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                        <div>
                          <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 6 }}>
                            Powers these tools
                          </p>
                          {integration.tools.map(tool => (
                            <div key={tool} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                              <ChevronRight size={10} style={{ color: 'var(--apex)', marginTop: 3, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{tool}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 6 }}>
                            Setup instructions
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--ink-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                            {integration.setupNote}
                          </p>
                          <a
                            href={integration.setupUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-display uppercase"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '5px 12px', borderRadius: 6, fontSize: 10,
                              letterSpacing: '0.06em', textDecoration: 'none',
                              background: 'var(--apex-dim)', color: 'var(--apex)',
                              border: '1px solid var(--apex-border)',
                            }}
                          >
                            Open setup page <ChevronRight size={10} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE TAB
// ─────────────────────────────────────────────────────────────────────────────
const SIDEBAR_SETUP_SQL = `create table sidebar_config (
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
  ('dashboard',     'Dashboard',    1,  'apex'),
  ('action-needed', 'Action Needed',2,  'braik'),
  ('reports',       'Reports',      3,  'apex'),
  ('pipeline',      'Pipeline',     4,  'buildvance'),
  ('calendar',      'Calendar',     5,  'apex'),
  ('inbox',         'Inbox',        6,  'apex'),
  ('projects',      'Projects',     7,  'buildvance'),
  ('braik-targets', 'Braik Targets',8,  'braik'),
  ('notes',         'Notes',        9,  'apex'),
  ('social',        'Social',       10, 'apex'),
  ('competitors',   'Competitors',  11, 'apex'),
  ('resources',     'Resources',    12, 'apex'),
  ('assistant',     'AI Assistant', 13, 'apex'),
  ('settings',      'Settings',     14, 'apex');`

function WorkspaceTab({ sidebarItems }: { sidebarItems: SidebarItem[] }) {
  const [thresholds, setThresholds] = useState({
    leads_open_days:      2,
    leads_contacted_days: 4,
    leads_proposal_days:  5,
    braik_outreach_days:  7,
    projects_quiet_days:  10,
  })
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8" style={{ maxWidth: 680 }}>
      <div>
        <h2 className="font-display" style={{ fontSize: 22, color: 'var(--ink-primary)', letterSpacing: '0.03em' }}>
          WORKSPACE SETTINGS
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
          Control how the workspace behaves for both users.
        </p>
      </div>

      {/* Sidebar customizer */}
      <div className="card" style={{ padding: 20 }}>
        <p className="font-display uppercase" style={{ color: 'var(--ink-primary)', fontSize: 14, letterSpacing: '0.06em', marginBottom: 4 }}>
          Customize Sidebar
        </p>
        <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 16 }}>
          Drag to reorder within each section, toggle visibility, and set brand accent per item.
        </p>
        {sidebarItems.length > 0 ? (
          <SidebarCustomizer initialItems={sidebarItems} />
        ) : (
          <div className="space-y-2">
            <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              Run the following SQL in your Supabase SQL editor to enable sidebar customization:
            </p>
            <pre
              style={{
                padding: 12, borderRadius: 8, fontSize: 11, lineHeight: 1.7,
                background: 'var(--body-bg)', border: '1px solid var(--card-border)',
                color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)',
              }}
            >
              {SIDEBAR_SETUP_SQL}
            </pre>
          </div>
        )}
      </div>

      {/* Action Needed thresholds */}
      <div className="card" style={{ padding: 20 }}>
        <p className="font-display uppercase" style={{ color: 'var(--ink-primary)', fontSize: 14, letterSpacing: '0.06em', marginBottom: 4 }}>
          Action Needed — Thresholds
        </p>
        <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 16 }}>
          How many days of silence before a record surfaces in Action Needed.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'leads_open_days',      label: 'Open lead — no contact',      brand: 'buildvance' },
            { key: 'leads_contacted_days', label: 'Contacted lead — no update',  brand: 'buildvance' },
            { key: 'leads_proposal_days',  label: 'Proposal sent — no response', brand: 'buildvance' },
            { key: 'braik_outreach_days',  label: 'Braik outreach — no reply',   brand: 'braik'      },
            { key: 'projects_quiet_days',  label: 'Active project — no update',  brand: 'apex'       },
          ].map(({ key, label, brand }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND[brand], display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number" min={1} max={30}
                  value={thresholds[key as keyof typeof thresholds]}
                  onChange={e => setThresholds(prev => ({ ...prev, [key]: parseInt(e.target.value) || 1 }))}
                  style={{
                    width: 52, padding: '4px 8px', textAlign: 'center',
                    background: 'var(--body-bg)', border: '1px solid var(--card-border)',
                    borderRadius: 6, color: 'var(--ink-primary)', fontFamily: 'var(--font-display)',
                    fontSize: 14,
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline stage labels */}
      <div className="card" style={{ padding: 20 }}>
        <p className="font-display uppercase" style={{ color: 'var(--ink-primary)', fontSize: 14, letterSpacing: '0.06em', marginBottom: 4 }}>
          Pipeline Stage Labels
        </p>
        <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 16 }}>
          Rename pipeline stages to match your sales language.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { key: 'open',      default: 'Open'          },
            { key: 'contacted', default: 'Contacted'     },
            { key: 'proposal',  default: 'Proposal Sent' },
            { key: 'closed',    default: 'Closed / Won'  },
          ].map(({ key, default: def }) => (
            <div key={key}>
              <p style={{ fontSize: 10, color: 'var(--ink-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{key}</p>
              <input
                type="text" defaultValue={def}
                style={{
                  width: '100%', padding: '7px 10px',
                  background: 'var(--body-bg)', border: '1px solid var(--card-border)',
                  borderRadius: 6, color: 'var(--ink-primary)', fontSize: 13,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        className="font-display uppercase"
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px',
          background: saved ? 'var(--buildvance)' : 'var(--apex)',
          color: '#fff', border: 'none', borderRadius: 8, fontSize: 12,
          letterSpacing: '0.06em', cursor: 'pointer', transition: 'background 0.2s',
        }}
      >
        <Save size={13} /> {saved ? 'Saved!' : 'Save changes'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS TAB
// ─────────────────────────────────────────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    action_needed_toast:   true,
    lead_added_toast:      true,
    weekly_digest_email:   false,
    braik_followup_remind: true,
    report_ready_toast:    true,
    github_error_toast:    true,
  })

  const togglePref = (key: keyof typeof prefs) =>
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))

  const rows: Array<{ key: keyof typeof prefs; label: string; description: string; brand?: string }> = [
    { key: 'action_needed_toast',   label: 'Action Needed alerts',       description: 'Toast when a new item surfaces in Action Needed',         brand: 'braik'      },
    { key: 'lead_added_toast',      label: 'Lead added',                 description: 'Toast when a new lead is added to Pipeline',              brand: 'buildvance' },
    { key: 'braik_followup_remind', label: 'Braik follow-up reminders',  description: 'Alert when a school target has gone quiet past threshold', brand: 'braik'      },
    { key: 'report_ready_toast',    label: 'Report ready',               description: 'Toast when a scheduled report finishes generating',        brand: 'apex'       },
    { key: 'github_error_toast',    label: 'GitHub sync errors',         description: 'Alert when GitHub API fails to fetch repo data',           brand: 'apex'       },
    { key: 'weekly_digest_email',   label: 'Weekly digest email',        description: 'Email summary of pipeline + Braik targets every Monday',   brand: 'apex'       },
  ]

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 22, color: 'var(--ink-primary)', letterSpacing: '0.03em' }}>
          NOTIFICATIONS
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
          Control what triggers alerts and emails for both users.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {rows.map(({ key, label, description, brand }, i) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: i < rows.length - 1 ? '1px solid var(--card-border)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                background: brand ? BRAND[brand] : 'var(--ink-muted)', display: 'inline-block',
              }} />
              <div>
                <p style={{ fontSize: 13, color: 'var(--ink-primary)', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{description}</p>
              </div>
            </div>
            <Toggle on={prefs[key]} onToggle={() => togglePref(key)} />
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 14, marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Bell size={14} style={{ color: 'var(--ink-muted)', flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
          Email notifications require Gmail to be connected and a verified sender address configured in Supabase Auth settings.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS PROFILE TAB
// ─────────────────────────────────────────────────────────────────────────────
function BusinessProfileTab() {
  const [saved, setSaved] = useState(false)
  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const inputStyle = {
    width: '100%', padding: '7px 10px',
    background: 'var(--body-bg)', border: '1px solid var(--card-border)',
    borderRadius: 6, color: 'var(--ink-primary)', fontSize: 13,
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 22, color: 'var(--ink-primary)', letterSpacing: '0.03em' }}>
          BUSINESS PROFILE
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
          Injected into the AI assistant&apos;s context so Claude always knows who you are — no re-explaining needed.
        </p>
      </div>

      {/* Apex TSG */}
      <div className="card card-apex" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--apex)', display: 'inline-block' }} />
          <p className="font-display uppercase" style={{ color: 'var(--apex)', fontSize: 13, letterSpacing: '0.08em' }}>
            Apex TSG — Company
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'Company name', placeholder: 'Apex Technical Solutions Group' },
            { label: 'Location',     placeholder: 'Tampa Bay, FL'                  },
            { label: 'Founded',      placeholder: '2023'                           },
            { label: 'Team size',    placeholder: '2'                              },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4 }}>{label}</p>
              <input type="text" placeholder={placeholder} style={inputStyle} />
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4 }}>Company description (feeds AI context)</p>
          <textarea rows={3} placeholder="Custom software and web development company. Two ventures: Buildvance and Braik.io." style={{
            ...inputStyle, resize: 'vertical', lineHeight: 1.5,
          }} />
        </div>
      </div>

      {/* Buildvance */}
      <div className="card card-buildvance" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--buildvance)', display: 'inline-block' }} />
          <p className="font-display uppercase" style={{ color: 'var(--buildvance)', fontSize: 13, letterSpacing: '0.08em' }}>
            Buildvance
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'Target market', placeholder: 'Small businesses, trades (plumbers, HVAC, contractors)' },
            { label: 'Core offer',    placeholder: 'Custom software & web development'                      },
            { label: 'Price range',   placeholder: '$3,000–$25,000 per project'                             },
            { label: 'Website',       placeholder: 'buildvance.com'                                         },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4 }}>{label}</p>
              <input type="text" placeholder={placeholder} style={inputStyle} />
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4 }}>Positioning / pitch (feeds AI context)</p>
          <textarea rows={3} placeholder="Software built around the way your business actually works. Workflow-first, not template-first." style={{
            ...inputStyle, resize: 'vertical', lineHeight: 1.5,
          }} />
        </div>
      </div>

      {/* Braik */}
      <div className="card card-braik" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--braik)', display: 'inline-block' }} />
          <p className="font-display uppercase" style={{ color: 'var(--braik)', fontSize: 13, letterSpacing: '0.08em' }}>
            Braik.io
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'Target users',  placeholder: 'High school ADs, head coaches (football-first)' },
            { label: 'Core offer',    placeholder: 'Sports program management SaaS'                  },
            { label: 'Pricing model', placeholder: 'Per-program subscription'                        },
            { label: 'Website',       placeholder: 'braik.io'                                        },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4 }}>{label}</p>
              <input type="text" placeholder={placeholder} style={inputStyle} />
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4 }}>Positioning / pitch (feeds AI context)</p>
          <textarea rows={3} placeholder="Built by coaches for coaches. Replaces the whiteboard and spreadsheet chaos most programs rely on." style={{
            ...inputStyle, resize: 'vertical', lineHeight: 1.5,
          }} />
        </div>
      </div>

      <button onClick={save} className="font-display uppercase" style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px',
        background: saved ? 'var(--buildvance)' : 'var(--apex)', color: '#fff',
        border: 'none', borderRadius: 8, fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer',
        transition: 'background 0.2s',
      }}>
        <Save size={13} /> {saved ? 'Saved!' : 'Save profile'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAM TAB
// ─────────────────────────────────────────────────────────────────────────────
function TeamTab() {
  const [saved, setSaved] = useState(false)
  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const members = [
    { name: 'Michael McClellan', role: 'CTO & Co-Founder', brand: 'apex',       email: 'michael.mcclellan@apextsgroup.com', focus: 'Braik.io, client dev, architecture' },
    { name: 'Kenny',             role: 'COO & Co-Founder', brand: 'buildvance',  email: '',                                  focus: 'Buildvance, ops, client relationships' },
  ]

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 22, color: 'var(--ink-primary)', letterSpacing: '0.03em' }}>
            TEAM
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
            Team profiles control assignment labels, AI context, and notification routing.
          </p>
        </div>
        <button className="font-display uppercase" style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
          background: 'var(--apex-dim)', color: 'var(--apex)', border: '1px solid var(--apex-border)',
          borderRadius: 7, fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer',
        }}>
          <Plus size={12} /> Invite user
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {members.map((member, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: `color-mix(in srgb, ${BRAND[member.brand]} 15%, var(--body-bg))`,
                border: `2px solid ${BRAND[member.brand]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="font-display" style={{ color: BRAND[member.brand], fontSize: 18 }}>
                  {member.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-display" style={{ color: 'var(--ink-primary)', fontSize: 15, letterSpacing: '0.02em' }}>{member.name}</p>
                <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{member.role}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Email',         value: member.email, placeholder: 'name@apextsgroup.com' },
                { label: 'Primary focus', value: member.focus, placeholder: 'What they work on'    },
              ].map(({ label, value, placeholder }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 4 }}>{label}</p>
                  <input type="text" defaultValue={value} placeholder={placeholder} style={{
                    width: '100%', padding: '7px 10px',
                    background: 'var(--body-bg)', border: '1px solid var(--card-border)',
                    borderRadius: 6, color: 'var(--ink-primary)', fontSize: 13,
                  }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={save} className="font-display uppercase" style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', marginTop: 20,
        background: saved ? 'var(--buildvance)' : 'var(--apex)', color: '#fff',
        border: 'none', borderRadius: 8, fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer',
        transition: 'background 0.2s',
      }}>
        <Save size={13} /> {saved ? 'Saved!' : 'Save team'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// APPEARANCE TAB
// ─────────────────────────────────────────────────────────────────────────────
function AppearanceTab() {
  const [circuitOpacity, setCircuitOpacity] = useState(14)
  const [showPulse, setShowPulse]           = useState(true)
  const [density, setDensity]               = useState<'compact' | 'comfortable'>('comfortable')
  const [saved, setSaved]                   = useState(false)
  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 22, color: 'var(--ink-primary)', letterSpacing: '0.03em' }}>
          APPEARANCE
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
          Visual preferences. Changes apply for all users.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 13, color: 'var(--ink-primary)', fontWeight: 500 }}>Circuit overlay intensity</p>
              <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Opacity of the animated circuit trace pattern</p>
            </div>
            <span className="font-display" style={{ color: 'var(--apex)', fontSize: 20 }}>{circuitOpacity}%</span>
          </div>
          <input type="range" min={0} max={40} value={circuitOpacity}
            onChange={e => setCircuitOpacity(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--apex)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--ink-disabled)' }}>Hidden</span>
            <span style={{ fontSize: 10, color: 'var(--ink-disabled)' }}>Bold</span>
          </div>
        </div>

        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-primary)', fontWeight: 500 }}>Activity pulse</p>
            <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Show the animated heartbeat line on the dashboard</p>
          </div>
          <Toggle on={showPulse} onToggle={() => setShowPulse(!showPulse)} />
        </div>

        <div className="card" style={{ padding: 18 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-primary)', fontWeight: 500, marginBottom: 10 }}>Layout density</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(['comfortable', 'compact'] as const).map(d => (
              <button key={d} onClick={() => setDensity(d)} className="font-display uppercase" style={{
                padding: '12px', borderRadius: 8, border: '2px solid',
                borderColor: density === d ? 'var(--apex)' : 'var(--card-border)',
                background: density === d ? 'var(--apex-dim)' : 'var(--body-bg)',
                color: density === d ? 'var(--apex)' : 'var(--ink-muted)',
                cursor: 'pointer', fontSize: 12, letterSpacing: '0.06em', transition: 'all 0.15s',
              }}>
                {d === 'comfortable'
                  ? <Sun size={18} style={{ display: 'block', margin: '0 auto 6px' }} />
                  : <Moon size={18} style={{ display: 'block', margin: '0 auto 6px' }} />}
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={save} className="font-display uppercase" style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', marginTop: 20,
        background: saved ? 'var(--buildvance)' : 'var(--apex)', color: '#fff',
        border: 'none', borderRadius: 8, fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer',
        transition: 'background 0.2s',
      }}>
        <Save size={13} /> {saved ? 'Saved!' : 'Save appearance'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA & EXPORT TAB
// ─────────────────────────────────────────────────────────────────────────────
function DataTab({ userEmail }: { userEmail: string | undefined }) {
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 22, color: 'var(--ink-primary)', letterSpacing: '0.03em' }}>
          DATA &amp; EXPORT
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
          Export your data, manage test records, and view storage usage.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card" style={{ padding: 20 }}>
          <p className="font-display uppercase" style={{ color: 'var(--ink-primary)', fontSize: 14, letterSpacing: '0.06em', marginBottom: 14 }}>
            Export data
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Leads (Pipeline)',  desc: 'All leads with status + notes',   brand: 'buildvance' },
              { label: 'Braik Targets',     desc: 'All school targets with status',   brand: 'braik'      },
              { label: 'Projects',          desc: 'All projects with status + repos', brand: 'buildvance' },
              { label: 'Notes',             desc: 'All notes with linked records',    brand: 'apex'       },
              { label: 'Social Scorecard',  desc: 'Weekly scorecard history',         brand: 'apex'       },
              { label: 'Reports (JSON)',    desc: 'All generated reports archive',     brand: 'apex'       },
            ].map(({ label, desc, brand }) => (
              <button key={label} className="font-display" style={{
                padding: '12px 14px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                background: `color-mix(in srgb, ${BRAND[brand]} 5%, var(--body-bg))`,
                border: `1px solid color-mix(in srgb, ${BRAND[brand]} 20%, var(--card-border))`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--ink-primary)', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{desc}</p>
                </div>
                <Download size={14} style={{ color: BRAND[brand], flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <p className="font-display uppercase" style={{ color: 'var(--ink-primary)', fontSize: 14, letterSpacing: '0.06em', marginBottom: 14 }}>
            Account
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="font-display" style={{ color: 'var(--ink-primary)', fontSize: 16 }}>{userEmail}</p>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Apex TSG Workspace</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, borderColor: '#fecaca' }}>
          <p className="font-display uppercase" style={{ color: '#dc2626', fontSize: 13, letterSpacing: '0.08em', marginBottom: 12 }}>
            Danger zone
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Clear test leads',  desc: 'Remove all leads tagged as test data',          action: 'Clear' },
              { label: 'Reset all reports', desc: 'Delete all cached report records from database', action: 'Reset' },
            ].map(({ label, desc, action }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: action === 'Clear' ? '1px solid #fecaca' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--ink-primary)' }}>{label}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{desc}</p>
                </div>
                <button className="font-display uppercase" style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 10, letterSpacing: '0.06em',
                  background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Trash2 size={10} />{action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SETTINGS CLIENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsClient({ user, envFlags, sidebarItems }: Props) {
  const [activeTab, setActiveTab] = useState('integrations')
  const integrations = makeIntegrations(envFlags)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <p className="font-display uppercase" style={{ color: 'var(--apex)', fontSize: 11, letterSpacing: '0.1em' }}>
          APEX TSG
        </p>
        <h1 className="font-display" style={{ color: 'var(--ink-primary)', fontSize: 36, lineHeight: 1 }}>
          CONFIG
        </h1>
      </div>

      {/* Top tab bar */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 28, marginTop: 16,
        borderBottom: '1px solid var(--card-border)',
        overflowX: 'auto',
      }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="font-display uppercase"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', border: 'none', cursor: 'pointer',
                background: 'transparent', whiteSpace: 'nowrap',
                color: active ? 'var(--apex)' : 'var(--ink-muted)',
                fontSize: 11, letterSpacing: '0.08em',
                borderBottom: active ? '2px solid var(--apex)' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'integrations'  && <IntegrationsTab  integrations={integrations} />}
      {activeTab === 'workspace'     && <WorkspaceTab     sidebarItems={sidebarItems} />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'business'      && <BusinessProfileTab />}
      {activeTab === 'team'          && <TeamTab />}
      {activeTab === 'appearance'    && <AppearanceTab />}
      {activeTab === 'data'          && <DataTab userEmail={user.email} />}
    </div>
  )
}

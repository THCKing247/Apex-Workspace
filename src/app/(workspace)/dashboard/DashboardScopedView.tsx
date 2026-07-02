'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useBrandScope } from '@/lib/brand-scope-context'
import BrandLogoSwitcher from '@/components/BrandLogoSwitcher'
import { PipelineChart, ActivityChart, Gauge } from './DashboardCharts'
import TerritoryMap from '@/components/TerritoryMap'
import {
  ArrowRight, Kanban, GitBranch, BarChart2, Calendar,
} from 'lucide-react'

// ─── Client-side scoped dashboard ───────────────────────────────────────────
// All data is fetched ONCE server-side (see page.tsx) and handed down here.
// Switching brand scope re-filters/re-computes everything client-side —
// instant, no network round trip, no reload.

const BRAND_COLOR: Record<string, string> = {
  buildvance: 'var(--buildvance)',
  braik:      'var(--braik)',
  apex:       'var(--apex)',
}

interface Props {
  leads:        Array<{ id: string; brand: string; status: string; created_at: string }>
  pipeline:     Array<{ stage: string; buildvance: number; braik: number }>
  activity:     Array<{ day: string; buildvance: number; braik: number }>
  socialScores: Record<string, number | null>
  events:       Array<{ id: string; title: string; start_time: string; brand: string | null }>
  projects:     Array<{ id: string; name: string; brand: string; status: string }>
  mapLeads:     Array<{ id: string; lat: number; lng: number; brand: string }>
  mapTargets:   Array<{ id: string; lat: number; lng: number }>
}

function KpiCard({ label, value, brand, connect, href }: {
  label: string; value: string | number; brand: string; connect?: string; href: string
}) {
  const color = BRAND_COLOR[brand]
  return (
    <Link href={href} className="card" style={{ padding: '12px 14px', display: 'block', textDecoration: 'none' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = `0 4px 16px rgba(13,27,61,0.12), 0 0 0 1px ${color}44` }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '' }}
    >
      <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em' }}>{label}</p>
      <p className="font-display" style={{ color: connect ? 'var(--ink-disabled)' : color, fontSize: 28, lineHeight: 1.1, marginTop: 3 }}>{value}</p>
      {connect ? (
        <span className="font-display uppercase" style={{ display: 'inline-block', marginTop: 5, fontSize: 9, letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 4, background: 'rgba(91,155,255,0.08)', color: 'var(--apex)', border: '1px solid rgba(91,155,255,0.25)' }}>{connect}</span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4, color, fontSize: 10, fontFamily: 'var(--font-display)' }}>View <ArrowRight size={10} /></span>
      )}
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display uppercase tracking-widest" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>
      {children}
    </p>
  )
}

export default function DashboardScopedView(props: Props) {
  const { scope } = useBrandScope()
  const scopeColor = scope === 'all' ? 'var(--apex)' : BRAND_COLOR[scope]
  const scopeLabel = scope === 'all' ? 'APEX TSG — ALL BUSINESSES' : scope.toUpperCase()

  const scopedLeads = useMemo(
    () => scope === 'all' ? props.leads : props.leads.filter(l => l.brand === scope),
    [props.leads, scope]
  )
  const openLeadsCount = scopedLeads.filter(l => l.status === 'open').length
  const closedCount    = scopedLeads.filter(l => l.status === 'closed').length
  const closeRate      = scopedLeads.length > 0 ? Math.round((closedCount / scopedLeads.length) * 100) : 0

  const scopedProjects = useMemo(
    () => scope === 'all' ? props.projects : props.projects.filter(p => p.brand === scope),
    [props.projects, scope]
  )
  const buildvanceProjCount = props.projects.filter(p => p.brand === 'buildvance' && p.status === 'active').length
  const braikProjCount      = props.projects.filter(p => p.brand === 'braik' && p.status === 'active').length
  const activeProjCount     = scopedProjects.filter(p => p.status === 'active').length

  const scopedPipeline = useMemo(() => props.pipeline.map(row => ({
    stage:      row.stage,
    buildvance: (scope === 'all' || scope === 'buildvance') ? row.buildvance : 0,
    braik:      (scope === 'all' || scope === 'braik')      ? row.braik      : 0,
  })), [props.pipeline, scope])

  const scopedActivity = useMemo(() => props.activity.map(row => ({
    day:        row.day,
    buildvance: (scope === 'all' || scope === 'buildvance') ? row.buildvance : 0,
    braik:      (scope === 'all' || scope === 'braik')      ? row.braik      : 0,
  })), [props.activity, scope])

  const scopedMapPoints = useMemo(() => {
    const leadPts   = (scope === 'all' || scope === 'buildvance') ? props.mapLeads.map(l => ({ lat: l.lat, lng: l.lng, type: 'buildvance' as const })) : []
    const targetPts = (scope === 'all' || scope === 'braik')      ? props.mapTargets.map(t => ({ lat: t.lat, lng: t.lng, type: 'braik' as const }))    : []
    return [...leadPts, ...targetPts]
  }, [props.mapLeads, props.mapTargets, scope])

  const scopedEvents = useMemo(
    () => scope === 'all' ? props.events : props.events.filter(e => !e.brand || e.brand === scope || e.brand === 'apex'),
    [props.events, scope]
  )

  const socialScoreValue = scope === 'all'
    ? props.socialScores.apex ?? null
    : props.socialScores[scope] ?? null

  return (
    <div className="space-y-5">

      {/* ── Header + logo switcher ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display uppercase" style={{ color: scopeColor, fontSize: 11, letterSpacing: '0.1em' }}>{scopeLabel}</p>
          <h1 className="font-display" style={{ color: 'var(--ink-primary)', fontSize: 36, lineHeight: 1 }}>COMMAND CENTER</h1>
        </div>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <BrandLogoSwitcher />
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      <div className="grid gap-3" style={{ gridTemplateColumns: scope === 'all' ? 'repeat(6, 1fr)' : 'repeat(5, 1fr)' }}>
        <KpiCard label="Open Leads" value={openLeadsCount} brand={scope === 'all' ? 'apex' : scope} href="/pipeline" />

        {scope === 'all' ? (
          <>
            <KpiCard label="Buildvance Proj" value={buildvanceProjCount} brand="buildvance" href="/projects?brand=buildvance" />
            <KpiCard label="Braik Proj"      value={braikProjCount}      brand="braik"      href="/projects?brand=braik" />
          </>
        ) : (
          <KpiCard label="Active Projects" value={activeProjCount} brand={scope} href={`/projects?brand=${scope}`} />
        )}

        <KpiCard label="Commits 7d"      value="—" brand={scope === 'all' ? 'apex' : scope} connect="add GITHUB_TOKEN"      href="/settings" />
        <KpiCard label="Social Reach 7d" value="—" brand={scope === 'all' ? 'apex' : scope} connect="add META_ACCESS_TOKEN" href="/social" />
        <KpiCard label="Unread"          value="—" brand={scope === 'all' ? 'apex' : scope} connect="connect Gmail"         href="/inbox" />
      </div>

      {/* ── Map + pipeline row ─────────────────────────────────────────────── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionLabel>Territory map</SectionLabel>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ label: 'foothold', color: 'var(--apex)' },
                ...(scope !== 'braik' ? [{ label: 'buildvance lead', color: 'var(--buildvance)' }] : []),
                ...(scope !== 'buildvance' ? [{ label: 'braik target', color: 'var(--braik)' }] : [])]
                .map(({ label, color }) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />{label}
                  </span>
                ))}
            </div>
          </div>
          <TerritoryMap points={scopedMapPoints} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/pipeline" className="card" style={{ padding: 16, flex: 1, textDecoration: 'none', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <SectionLabel>Pipeline{scope !== 'all' ? ` — ${scope}` : ' by unit'}</SectionLabel>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--apex)', fontSize: 10, fontFamily: 'var(--font-display)' }}><Kanban size={11} /> View pipeline</span>
            </div>
            <PipelineChart data={scopedPipeline} />
          </Link>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <SectionLabel>Scores</SectionLabel>
              <Link href="/social" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--apex)', fontSize: 10, fontFamily: 'var(--font-display)', textDecoration: 'none' }}><BarChart2 size={11} /> Social page</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <Link href="/social" style={{ textDecoration: 'none' }}>
                <Gauge value={socialScoreValue} label="social score" color={scope === 'all' ? 'var(--apex)' : scopeColor} />
              </Link>
              <Link href="/pipeline" style={{ textDecoration: 'none' }}>
                <Gauge value={closeRate} label="close rate" color="var(--buildvance)" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity ───────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <SectionLabel>Activity — 7 days</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'var(--ink-muted)', fontSize: 10, fontFamily: 'var(--font-display)' }}>
              {scope === 'all' ? 'both brands' : scope}
            </span>
            <Link href="/reports" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--apex)', fontSize: 10, fontFamily: 'var(--font-display)', textDecoration: 'none' }}>
              Full reports <ArrowRight size={10} />
            </Link>
          </div>
        </div>
        <ActivityChart data={scopedActivity} />
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <SectionLabel>Upcoming</SectionLabel>
            <Link href="/calendar" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--apex)', fontSize: 10, fontFamily: 'var(--font-display)', textDecoration: 'none' }}><Calendar size={11} /> Open calendar</Link>
          </div>
          {scopedEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scopedEvents.slice(0, 5).map(ev => (
                <Link key={ev.id} href="/calendar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
                  <p style={{ fontSize: 12, color: 'var(--ink-primary)' }}>{ev.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(ev.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>No events synced yet.</p>
              <Link href="/calendar" className="font-display uppercase" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9, letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 5, background: 'var(--braik-dim)', color: 'var(--braik)', border: '1px solid var(--braik-border)', textDecoration: 'none' }}><Calendar size={10} /> Connect calendar</Link>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <SectionLabel>Project status</SectionLabel>
            <Link href="/projects" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--apex)', fontSize: 10, fontFamily: 'var(--font-display)', textDecoration: 'none' }}><GitBranch size={11} /> All projects</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {scopedProjects.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>No {scope !== 'all' ? scope : ''} projects yet.</p>
            ) : scopedProjects.map(p => {
              const color = BRAND_COLOR[p.brand] ?? 'var(--ink-muted)'
              return (
                <Link key={p.id} href="/projects" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: 'var(--ink-primary)' }}>{p.name}</p>
                  </div>
                  <span className="font-display uppercase" style={{ fontSize: 9, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 4, background: `color-mix(in srgb, ${color} 10%, transparent)`, color }}>{p.status}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <Link href="/assistant" className="card" style={{ padding: 16, textDecoration: 'none', display: 'block', borderColor: `color-mix(in srgb, ${scopeColor} 30%, var(--card-border))` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <SectionLabel>AI suggestion</SectionLabel>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: scopeColor, fontSize: 10, fontFamily: 'var(--font-display)' }}>Open assistant <ArrowRight size={10} /></span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
            {scope === 'all'
              ? 'Connect Meta + Anthropic keys for AI post-performance suggestions here.'
              : `Ask the assistant for ${scope}-specific recommendations once Meta + Anthropic are connected.`}
          </p>
        </Link>
      </div>

    </div>
  )
}

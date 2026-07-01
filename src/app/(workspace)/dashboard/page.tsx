import Image from 'next/image'
import {
  getOpenLeadsCount,
  getProjectsByBrand,
  getPipelineByStage,
  getRecentActivity,
  getSocialScore,
  getCloseRate,
  getUpcomingEvents,
  getProjects,
  getLeadsWithCoords,
  getBraikTargetsWithCoords,
} from '@/lib/queries/dashboard'
import { PipelineChart, ActivityChart, Gauge } from './DashboardCharts'
import TerritoryMap from '@/components/TerritoryMap'

export const metadata = { title: 'Dashboard — Apex Workspace' }
export const dynamic = 'force-dynamic'

const BRAND_COLOR: Record<string, string> = {
  buildvance: 'var(--buildvance)',
  braik:      'var(--braik)',
  apex:       'var(--apex)',
}
const BRAND_CARD_CLASS: Record<string, string> = {
  buildvance: 'card card-buildvance',
  braik:      'card card-braik',
  apex:       'card card-apex',
}

function KpiCard({
  label,
  value,
  brand = 'apex',
  connect,
}: {
  label: string
  value: string | number
  brand?: 'buildvance' | 'braik' | 'apex'
  connect?: string
}) {
  return (
    <div className={BRAND_CARD_CLASS[brand]} style={{ padding: '12px 14px' }}>
      <p
        className="font-display uppercase tracking-widest"
        style={{ color: 'var(--ink-muted)', fontSize: 11, letterSpacing: '0.08em' }}
      >
        {label}
      </p>
      <p
        className="font-display"
        style={{ color: BRAND_COLOR[brand], fontSize: 30, lineHeight: 1.1, marginTop: 4 }}
      >
        {value}
      </p>
      {connect && (
        <span
          className="font-display uppercase"
          style={{
            display: 'inline-block',
            marginTop: 6,
            fontSize: 9,
            letterSpacing: '0.06em',
            padding: '2px 7px',
            borderRadius: 4,
            background: `color-mix(in srgb, ${BRAND_COLOR[brand]} 10%, transparent)`,
            color: BRAND_COLOR[brand],
            border: `1px solid color-mix(in srgb, ${BRAND_COLOR[brand]} 30%, transparent)`,
          }}
        >
          {connect}
        </span>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-display uppercase tracking-widest"
      style={{ color: 'var(--ink-muted)', fontSize: 11, letterSpacing: '0.08em', marginBottom: 2 }}
    >
      {children}
    </p>
  )
}

export default async function DashboardPage() {
  const [
    openLeads,
    projectsByBrand,
    pipeline,
    activity,
    socialScore,
    closeRate,
    events,
    projects,
    leads,
    targets,
  ] = await Promise.all([
    getOpenLeadsCount(),
    getProjectsByBrand(),
    getPipelineByStage(),
    getRecentActivity(),
    getSocialScore(),
    getCloseRate(),
    getUpcomingEvents(),
    getProjects(),
    getLeadsWithCoords(),
    getBraikTargetsWithCoords(),
  ])

  const mapPoints = [
    ...leads.map((l) => ({ lat: Number(l.lat), lng: Number(l.lng), type: 'buildvance' as const })),
    ...targets.map((t) => ({ lat: Number(t.lat), lng: Number(t.lng), type: 'braik' as const })),
  ]

  return (
    <div className="space-y-5">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display uppercase tracking-widest"
            style={{ color: 'var(--apex)', fontSize: 11, letterSpacing: '0.1em' }}>
            APEX TSG — HQ
          </p>
          <h1 className="font-display" style={{ color: 'var(--ink-primary)', fontSize: 36, lineHeight: 1 }}>
            COMMAND CENTER
          </h1>
        </div>
        <div className="flex items-center gap-4 pt-1">
          <Image
            src="/logos/buildvance-logo.png"
            alt="Buildvance"
            width={96}
            height={30}
            style={{ objectFit: 'contain', objectPosition: 'right center' }}
          />
          <Image
            src="/logos/braik-logo.png"
            alt="Braik"
            width={64}
            height={30}
            style={{ objectFit: 'contain', objectPosition: 'right center' }}
          />
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-6 gap-3">
        <KpiCard label="Open Leads"      value={openLeads}                  brand="apex" />
        <KpiCard label="Buildvance Proj" value={projectsByBrand.buildvance} brand="buildvance" />
        <KpiCard label="Braik Proj"      value={projectsByBrand.braik}      brand="braik" />
        <KpiCard label="Commits 7d"      value="—" brand="apex" connect="add GITHUB_TOKEN" />
        <KpiCard label="Social Reach 7d" value="—" brand="apex" connect="add META_ACCESS_TOKEN" />
        <KpiCard label="Unread"          value="—" brand="apex" connect="connect Gmail" />
      </div>

      {/* ── Territory map + pipeline/gauges ──────────────────────────────── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Map */}
        <div className="card" style={{ padding: 16 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <SectionLabel>Territory map</SectionLabel>
            <div className="flex items-center gap-3">
              {[
                { label: 'foothold',        color: 'var(--apex)'       },
                { label: 'buildvance lead', color: 'var(--buildvance)' },
                { label: 'braik target',    color: 'var(--braik)'      },
              ].map(({ label, color }) => (
                <span key={label} className="flex items-center gap-1"
                  style={{ color: 'var(--ink-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, display: 'inline-block' }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <TerritoryMap points={mapPoints} />
        </div>

        {/* Pipeline chart + gauges */}
        <div className="flex flex-col gap-4">
          <div className="card" style={{ padding: 16, flex: 1 }}>
            <SectionLabel>Pipeline by unit</SectionLabel>
            <PipelineChart data={pipeline} />
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div className="flex items-center justify-around">
              <Gauge value={socialScore} label="social score" color="var(--apex)"       />
              <Gauge value={closeRate}   label="close rate"   color="var(--buildvance)" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity chart ────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 16 }}>
        <SectionLabel>Activity — 7 days</SectionLabel>
        <ActivityChart data={activity} />
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="card" style={{ padding: 16 }}>
          <SectionLabel>Upcoming — calendar</SectionLabel>
          {events.length > 0 ? (
            <div className="space-y-2 mt-2">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between">
                  <p style={{ fontSize: 13, color: 'var(--ink-primary)', fontFamily: 'var(--font-sans)' }}>{ev.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(ev.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>No events synced yet.</p>
              <span
                className="font-display uppercase"
                style={{
                  display: 'inline-block', fontSize: 9, letterSpacing: '0.06em',
                  padding: '3px 8px', borderRadius: 4,
                  background: 'var(--braik-dim)', color: 'var(--braik)',
                  border: '1px solid var(--braik-border)',
                }}
              >
                Connect Calendar
              </span>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="card" style={{ padding: 16 }}>
          <SectionLabel>Project status</SectionLabel>
          <div className="space-y-2 mt-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: BRAND_COLOR[p.brand] ?? 'var(--ink-muted)', display: 'inline-block' }} />
                  <p style={{ fontSize: 13, color: 'var(--ink-primary)' }}>{p.name}</p>
                </div>
                <span
                  className="font-display uppercase"
                  style={{
                    fontSize: 9, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 4,
                    background: `color-mix(in srgb, ${BRAND_COLOR[p.brand] ?? '#888'} 10%, transparent)`,
                    color: BRAND_COLOR[p.brand] ?? 'var(--ink-muted)',
                  }}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI suggestion */}
        <div className="card card-apex" style={{ padding: 16 }}>
          <SectionLabel>AI suggestion</SectionLabel>
          <p style={{ fontSize: 12, color: 'var(--ink-secondary)', marginTop: 6 }}>
            Connect Meta + Anthropic keys for post-performance suggestions here.
          </p>
        </div>
      </div>
    </div>
  )
}

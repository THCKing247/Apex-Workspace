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

// Card style helpers
const apexCard = {
  background: 'linear-gradient(180deg,#16265a 0%,#10204a 100%)',
  border: '1px solid rgba(91,155,255,0.3)',
  borderRadius: 8,
} as const

const buildvanceCard = {
  background: 'linear-gradient(180deg,#0e2b22 0%,#0a221b 100%)',
  border: '1px solid rgba(0,224,138,0.35)',
  borderRadius: 8,
} as const

const braikCard = {
  background: 'linear-gradient(180deg,#2e1c10 0%,#26170c 100%)',
  border: '1px solid rgba(255,122,51,0.35)',
  borderRadius: 8,
} as const

const BRAND_COLOR: Record<string, string> = {
  buildvance: '#00E08A',
  braik: '#FF7A33',
  apex: '#5B9BFF',
}

interface KpiCardProps {
  label: string
  value: string | number
  color?: string
  connect?: string
  cardStyle?: React.CSSProperties
}

function KpiCard({ label, value, color, connect, cardStyle }: KpiCardProps) {
  return (
    <div className="card-depth p-3 flex flex-col gap-1" style={cardStyle ?? apexCard}>
      <p
        className="uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-teko)', fontSize: 11, color: '#7d9cd9', letterSpacing: '0.05em' }}
      >
        {label}
      </p>
      <p
        className="font-semibold"
        style={{ fontFamily: 'var(--font-teko)', fontSize: '1.875rem', color: color ?? '#f4f8ff', lineHeight: 1 }}
      >
        {value}
      </p>
      {connect && (
        <span
          className="text-xs px-1.5 py-0.5 rounded self-start"
          style={{
            backgroundColor: 'rgba(91,155,255,0.1)',
            color: '#5f73a3',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
          }}
        >
          {connect}
        </span>
      )}
    </div>
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
    ...leads.map((l) => ({
      lat: Number(l.lat),
      lng: Number(l.lng),
      type: 'buildvance' as const,
    })),
    ...targets.map((t) => ({
      lat: Number(t.lat),
      lng: Number(t.lng),
      type: 'braik' as const,
    })),
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p
            className="uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-teko)', fontSize: 11, color: '#5f73a3', letterSpacing: '0.05em' }}
          >
            APEX TSG — HQ
          </p>
          <h1
            className="font-semibold uppercase"
            style={{ fontFamily: 'var(--font-teko)', fontSize: '2rem', color: '#f4f8ff', lineHeight: 1 }}
          >
            Command center
          </h1>
        </div>
        <div className="flex items-center gap-4 pt-1">
          <span
            className="flex items-center gap-1.5 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#00E08A' }}
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#00E08A' }} />
            buildvance
          </span>
          <span
            className="flex items-center gap-1.5 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#FF7A33' }}
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#FF7A33' }} />
            braik
          </span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-6 gap-2">
        <KpiCard label="Open Leads" value={openLeads} />
        <KpiCard
          label="Buildvance Proj"
          value={projectsByBrand.buildvance}
          color="#00E08A"
          cardStyle={buildvanceCard}
        />
        <KpiCard
          label="Braik Proj"
          value={projectsByBrand.braik}
          color="#FF7A33"
          cardStyle={braikCard}
        />
        <KpiCard label="Commits 7d" value="—" connect="add GITHUB_TOKEN" />
        <KpiCard label="Social Reach 7d" value="—" connect="add META_ACCESS_TOKEN" />
        <KpiCard label="Unread" value="—" connect="connect Gmail" />
      </div>

      {/* Map + Charts row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Territory map — neutral apex-bg */}
        <div className="card-depth p-4" style={apexCard}>
          <div className="flex items-center justify-between mb-3">
            <p
              className="uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#7d9cd9', letterSpacing: '0.05em' }}
            >
              Territory map
            </p>
            <div className="flex items-center gap-3">
              {[
                { label: 'foothold', color: '#5B9BFF' },
                { label: 'buildvance lead', color: '#00E08A' },
                { label: 'braik target', color: '#FF7A33' },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  className="flex items-center gap-1 uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-teko)', fontSize: 10, color: '#5f73a3' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <TerritoryMap points={mapPoints} />
          <p className="text-xs mt-2" style={{ color: '#3d4f87', fontFamily: 'var(--font-mono)', fontSize: 9 }}>
            Sample markers — wires to leads + braik_targets tables (lat/lng or state).
          </p>
        </div>

        {/* Right column: pipeline chart + gauges */}
        <div className="flex flex-col gap-4">
          <div className="card-depth p-4 flex-1" style={apexCard}>
            <p
              className="uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#7d9cd9', letterSpacing: '0.05em' }}
            >
              Pipeline by unit
            </p>
            <PipelineChart data={pipeline} />
          </div>

          <div className="card-depth p-4" style={apexCard}>
            <div className="flex items-center justify-around">
              <Gauge value={socialScore} label="social score" color="#5B9BFF" />
              <Gauge value={closeRate} label="close rate" color="#5B9BFF" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity chart — neutral apex-bg */}
      <div className="card-depth p-4" style={apexCard}>
        <p
          className="uppercase tracking-widest mb-3"
          style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#7d9cd9', letterSpacing: '0.05em' }}
        >
          Activity — 7 days
        </p>
        <ActivityChart data={activity} />
      </div>

      {/* Bottom row — all neutral apex-bg */}
      <div className="grid grid-cols-3 gap-4">
        {/* Upcoming calendar */}
        <div className="card-depth p-4" style={apexCard}>
          <p
            className="uppercase tracking-widest mb-3"
            style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#7d9cd9', letterSpacing: '0.05em' }}
          >
            Upcoming — calendar
          </p>
          {events.length > 0 ? (
            <div className="space-y-2">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between">
                  <p
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-teko)', color: '#f4f8ff', fontSize: 15 }}
                  >
                    {ev.title}
                  </p>
                  <p
                    className="text-xs"
                    style={{ fontFamily: 'var(--font-teko)', color: '#5f73a3', fontSize: 13 }}
                  >
                    {new Date(ev.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm" style={{ fontFamily: 'var(--font-teko)', color: '#5f73a3', fontSize: 15 }}>
                No events synced yet.
              </p>
              <span
                className="inline-block px-2 py-1 rounded uppercase tracking-widest"
                style={{
                  backgroundColor: '#FF7A33',
                  color: '#0d1b3d',
                  fontFamily: 'var(--font-teko)',
                  fontSize: 11,
                  letterSpacing: '0.05em',
                }}
              >
                connect calendar
              </span>
            </div>
          )}
        </div>

        {/* Project status */}
        <div className="card-depth p-4" style={apexCard}>
          <p
            className="uppercase tracking-widest mb-3"
            style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#7d9cd9', letterSpacing: '0.05em' }}
          >
            Project status
          </p>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: BRAND_COLOR[p.brand] ?? '#5f73a3' }}
                  />
                  <p
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-teko)', color: '#f4f8ff', fontSize: 15 }}
                  >
                    {p.name}
                  </p>
                </div>
                <span
                  className="px-1.5 py-0.5 rounded uppercase tracking-widest"
                  style={{
                    backgroundColor: `${BRAND_COLOR[p.brand] ?? '#5f73a3'}18`,
                    color: BRAND_COLOR[p.brand] ?? '#5f73a3',
                    fontFamily: 'var(--font-teko)',
                    fontSize: 10,
                    letterSpacing: '0.05em',
                  }}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI suggestion */}
        <div className="card-depth p-4" style={apexCard}>
          <p
            className="uppercase tracking-widest mb-3"
            style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#7d9cd9', letterSpacing: '0.05em' }}
          >
            AI suggestion
          </p>
          <p className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: '#7d9cd9', fontSize: 13 }}>
            Connect Meta + Anthropic keys for post-performance suggestions here.
          </p>
        </div>
      </div>
    </div>
  )
}

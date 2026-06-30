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
  buildvance: '#00E08A',
  braik: '#FF7A33',
  apex: '#5B9BFF',
}

function KpiCard({
  label,
  value,
  color,
  connect,
}: {
  label: string
  value: string | number
  color?: string
  connect?: string
}) {
  return (
    <div
      className="rounded-lg border p-3 flex flex-col gap-1"
      style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
    >
      <p
        className="text-xs uppercase tracking-widest"
        style={{ color: '#5d6b85', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
      >
        {label}
      </p>
      <p
        className="text-xl font-bold"
        style={{ fontFamily: 'monospace', color: color ?? '#eef2f8' }}
      >
        {value}
      </p>
      {connect && (
        <span
          className="text-xs px-1.5 py-0.5 rounded self-start"
          style={{ backgroundColor: '#1a2842', color: '#5d6b85', fontFamily: 'monospace', fontSize: 9 }}
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
    <div
      className="min-h-screen space-y-4 p-4"
      style={{ background: 'linear-gradient(to bottom, #0a0e1a, #070a12)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p
            className="uppercase tracking-widest text-xs"
            style={{ color: '#5d6b85', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
          >
            APEX TSG — HQ
          </p>
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'monospace' }}
          >
            Command center
          </h1>
        </div>
        <div className="flex items-center gap-4 pt-1">
          <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: 'monospace', color: '#00E08A' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#00E08A' }} />
            buildvance
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: 'monospace', color: '#FF7A33' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#FF7A33' }} />
            braik
          </span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-6 gap-2">
        <KpiCard label="Open Leads" value={openLeads} />
        <KpiCard label="Buildvance Proj" value={projectsByBrand.buildvance} color="#00E08A" />
        <KpiCard label="Braik Proj" value={projectsByBrand.braik} color="#FF7A33" />
        <KpiCard label="Commits 7d" value="—" connect="add GITHUB_TOKEN" />
        <KpiCard label="Social Reach 7d" value="—" connect="add META_ACCESS_TOKEN" />
        <KpiCard label="Unread" value="—" connect="connect Gmail" />
      </div>

      {/* Map + Charts row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Territory map */}
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: '#5d6b85', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
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
                  className="flex items-center gap-1 text-xs"
                  style={{ fontFamily: 'monospace', color: '#5d6b85', fontSize: 9 }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <TerritoryMap points={mapPoints} />
          <p className="text-xs mt-2" style={{ color: '#374151', fontFamily: 'monospace', fontSize: 9 }}>
            Sample markers — wires to leads + braik_targets tables (lat/lng or state).
          </p>
        </div>

        {/* Right column: pipeline chart + gauges */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-lg border p-4 flex-1"
            style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: '#5d6b85', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
            >
              Pipeline by unit
            </p>
            <PipelineChart data={pipeline} />
          </div>

          <div
            className="rounded-lg border p-4"
            style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
          >
            <div className="flex items-center justify-around">
              <Gauge value={socialScore} label="social score" color="#5B9BFF" />
              <Gauge value={closeRate} label="close rate" color="#5B9BFF" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity chart */}
      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
      >
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: '#5d6b85', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
        >
          Activity — 7 days
        </p>
        <ActivityChart data={activity} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Upcoming calendar */}
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: '#5d6b85', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
          >
            Upcoming — calendar
          </p>
          {events.length > 0 ? (
            <div className="space-y-2">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between">
                  <p className="text-xs text-white" style={{ fontFamily: 'monospace' }}>
                    {ev.title}
                  </p>
                  <p className="text-xs" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>
                    {new Date(ev.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>
                No events synced yet.
              </p>
              <span
                className="inline-block text-xs px-2 py-1 rounded"
                style={{ backgroundColor: '#FF7A33', color: '#070a12', fontFamily: 'monospace', fontSize: 9 }}
              >
                connect calendar
              </span>
            </div>
          )}
        </div>

        {/* Project status */}
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: '#5d6b85', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
          >
            Project status
          </p>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: BRAND_COLOR[p.brand] ?? '#5d6b85' }}
                  />
                  <p className="text-xs text-white" style={{ fontFamily: 'monospace' }}>
                    {p.name}
                  </p>
                </div>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${BRAND_COLOR[p.brand] ?? '#5d6b85'}18`,
                    color: BRAND_COLOR[p.brand] ?? '#5d6b85',
                    fontFamily: 'monospace',
                    fontSize: 9,
                  }}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI suggestion */}
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: '#5d6b85', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: 10 }}
          >
            AI suggestion
          </p>
          <p className="text-xs" style={{ color: '#8b95ab', fontFamily: 'monospace' }}>
            Connect Meta + Anthropic keys for post-performance suggestions here.
          </p>
        </div>
      </div>
    </div>
  )
}

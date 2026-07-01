'use client'

import { useState, useRef } from 'react'
import {
  BarChart2, Target, Map, Share2, Cpu, TrendingUp,
  RefreshCw, Download, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Clock, Loader2,
} from 'lucide-react'
import type { ReportType, ReportRecord, ReportData } from '@/lib/reports/types'
import { useBrandScope, type BrandScope } from '@/lib/brand-scope-context'

// ── Report catalogue ──────────────────────────────────────────────────────────
const REPORT_DEFS: Array<{
  type:           ReportType
  label:          string
  description:    string
  brand:          'buildvance' | 'braik' | 'apex'
  icon:           React.ElementType
  relevantScopes: BrandScope[]
}> = [
  { type: 'pipeline_health',    label: 'Pipeline Health',    description: 'Lead conversion, velocity, close rates by brand and source', brand: 'buildvance', icon: BarChart2,   relevantScopes: ['all', 'buildvance']             },
  { type: 'braik_outreach',     label: 'Braik Outreach',     description: 'School target funnel, response rates, state coverage',       brand: 'braik',      icon: Target,      relevantScopes: ['all', 'braik']                  },
  { type: 'territory_coverage', label: 'Territory Coverage', description: 'Geographic lead density, foothold vs gap analysis',           brand: 'apex',       icon: Map,         relevantScopes: ['all', 'buildvance', 'braik']     },
  { type: 'social_performance', label: 'Social Performance', description: 'Scorecard trends across Apex, Buildvance, and Braik',        brand: 'apex',       icon: Share2,      relevantScopes: ['all', 'braik']                  },
  { type: 'api_intelligence',   label: 'API Intelligence',   description: 'Integration health, competitor snapshots, Hunter usage',      brand: 'apex',       icon: Cpu,         relevantScopes: ['all', 'buildvance']             },
  { type: 'agent_performance',  label: 'Agent Performance',  description: 'Automated workflow runs, success rates, token costs',         brand: 'apex',       icon: TrendingUp,  relevantScopes: ['all', 'buildvance', 'braik']     },
]

const BRAND_COLOR: Record<string, string> = {
  buildvance: 'var(--buildvance)',
  braik:      'var(--braik)',
  apex:       'var(--apex)',
}

// ── PDF export helper ─────────────────────────────────────────────────────────
async function exportPDF(reportId: string, label: string) {
  // Dynamically load html2canvas + jsPDF only when needed (keeps initial bundle lean)
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  const el = document.getElementById(`report-${reportId}`)
  if (!el) return
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const imgW = 210
  const imgH = (canvas.height * imgW) / canvas.width
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH)
  pdf.save(`apex-${label.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const MAP: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    ready:      { icon: CheckCircle, color: '#00C97A', label: 'Ready' },
    error:      { icon: XCircle,     color: '#ef4444', label: 'Error' },
    generating: { icon: Loader2,     color: '#5B9BFF', label: 'Generating…' },
    pending:    { icon: Clock,       color: '#8892aa', label: 'Pending' },
  }
  const { icon: Icon, color, label } = MAP[status] ?? MAP.pending
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color, fontSize: 11, fontFamily: 'var(--font-display)' }}>
      <Icon size={12} className={status === 'generating' ? 'animate-spin' : ''} />
      {label}
    </span>
  )
}

// ── Data section renderers ────────────────────────────────────────────────────
function PipelineView({ data }: { data: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>Summary</p>
        {[
          { label: 'Total leads',   value: data.summary.total_leads },
          { label: 'New this period', value: data.summary.new_leads },
          { label: 'Closed won',    value: data.summary.closed_won },
          { label: 'Close rate',    value: `${data.summary.close_rate_pct}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{label}</span>
            <span className="font-display" style={{ color: 'var(--ink-primary)', fontSize: 14 }}>{value}</span>
          </div>
        ))}
      </div>
      <div>
        <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>By brand</p>
        {['buildvance', 'braik'].map(brand => {
          const b = data.by_brand[brand]
          const color = BRAND_COLOR[brand]
          return (
            <div key={brand} style={{ marginBottom: 10, padding: 10, borderRadius: 8, background: `color-mix(in srgb, ${color} 6%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)` }}>
              <p className="font-display uppercase" style={{ color, fontSize: 11, marginBottom: 4 }}>{brand}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {['open','contacted','proposal','closed'].map(s => (
                  <span key={s} style={{ fontSize: 11, color: 'var(--ink-secondary)' }}>{s}: <b style={{ color: 'var(--ink-primary)' }}>{b[s]}</b></span>
                ))}
              </div>
              <p style={{ fontSize: 11, color, marginTop: 4, fontFamily: 'var(--font-display)' }}>Close rate: {b.close_rate_pct}%</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BraikView({ data }: { data: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>Funnel</p>
        {[
          { label: 'Total targets',    value: data.summary.total_targets },
          { label: 'Outreach sent',    value: data.summary.outreach_sent },
          { label: 'Responded',        value: data.summary.responded },
          { label: 'Converted',        value: data.summary.converted },
          { label: 'Response rate',    value: `${data.summary.response_rate_pct}%` },
          { label: 'Conversion rate',  value: `${data.summary.conversion_rate_pct}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{label}</span>
            <span className="font-display" style={{ color: 'var(--braik)', fontSize: 14 }}>{value}</span>
          </div>
        ))}
      </div>
      <div>
        <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>Top states</p>
        {(data.by_state ?? []).slice(0, 6).map((s: any) => (
          <div key={s.state} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{s.state}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-primary)' }}>{s.count} targets / {s.converted} won</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TerritoryView({ data }: { data: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      <div>
        <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>Footholds</p>
        {(data.footholds ?? []).map((f: any) => (
          <div key={f.state} style={{ padding: '5px 0', borderBottom: '1px solid var(--card-border)' }}>
            <span className="font-display" style={{ color: 'var(--apex)', fontSize: 13 }}>{f.state}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-muted)', marginLeft: 8 }}>{f.role}</span>
          </div>
        ))}
      </div>
      <div>
        <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>Leads by state</p>
        {(data.leads_by_state ?? []).slice(0, 6).map((s: any) => (
          <div key={s.state} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{s.state}</span>
            <span style={{ fontSize: 12, color: BRAND_COLOR[s.brand] ?? 'var(--ink-primary)' }}>{s.count}</span>
          </div>
        ))}
      </div>
      <div>
        <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>Coverage gaps</p>
        {(data.coverage_gaps ?? []).map((g: string) => (
          <div key={g} style={{ padding: '4px 0', borderBottom: '1px solid var(--card-border)', fontSize: 12, color: 'var(--ink-secondary)' }}>
            {g}
          </div>
        ))}
      </div>
    </div>
  )
}

function SocialView({ data }: { data: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {Object.entries(data.by_brand ?? {}).map(([brand, v]: [string, any]) => {
        const color = BRAND_COLOR[brand] ?? 'var(--apex)'
        const trendColor = v.trend === 'up' ? '#00C97A' : v.trend === 'down' ? '#ef4444' : 'var(--ink-muted)'
        return (
          <div key={brand} style={{ padding: 12, borderRadius: 8, background: `color-mix(in srgb, ${color} 6%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)` }}>
            <p className="font-display uppercase" style={{ color, fontSize: 11, marginBottom: 8 }}>{brand}</p>
            {v.overall_avg !== null ? (
              <>
                <p className="font-display" style={{ color, fontSize: 28, lineHeight: 1 }}>{v.overall_avg}<span style={{ fontSize: 14 }}>/10</span></p>
                <p style={{ fontSize: 10, color: trendColor, fontFamily: 'var(--font-display)', marginTop: 4 }}>
                  {v.trend === 'up' ? '↑ Improving' : v.trend === 'down' ? '↓ Declining' : '→ Stable'} · {v.weeks_logged} weeks
                </p>
              </>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>No data logged yet</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ApiView({ data }: { data: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>Integrations</p>
        {(data.integrations_status ?? []).map((i: any) => (
          <div key={i.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--card-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{i.name}</span>
            <span style={{ fontSize: 11, color: i.connected ? '#00C97A' : '#ef4444', fontFamily: 'var(--font-display)' }}>
              {i.connected ? '✓ Connected' : '✗ Missing'}
            </span>
          </div>
        ))}
      </div>
      <div>
        <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>Competitors tracked</p>
        {(data.competitor_snapshots ?? []).length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>No competitors added yet — visit the Competitors page.</p>
        ) : (data.competitor_snapshots ?? []).map((c: any) => (
          <div key={c.name} style={{ padding: '5px 0', borderBottom: '1px solid var(--card-border)' }}>
            <span className="font-display" style={{ color: BRAND_COLOR[c.brand] ?? 'var(--apex)', fontSize: 12 }}>{c.name}</span>
            <span style={{ fontSize: 10, color: 'var(--ink-muted)', marginLeft: 8 }}>
              {c.last_reviewed ? `Reviewed ${c.last_reviewed}` : 'Never reviewed'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentView({ data }: { data: any }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <TrendingUp size={40} style={{ color: 'var(--ink-disabled)', margin: '0 auto 12px' }} />
      <p className="font-display uppercase" style={{ color: 'var(--ink-muted)', fontSize: 14, letterSpacing: '0.08em', marginBottom: 8 }}>
        No agents deployed yet
      </p>
      <p style={{ fontSize: 13, color: 'var(--ink-muted)', maxWidth: 400, margin: '0 auto', lineHeight: 1.5 }}>
        This report will track automated workflow runs, success rates, token costs, and outcomes once AI agents are active.
        The data model is ready — deploy your first agent to start seeing metrics here.
      </p>
    </div>
  )
}

function ReportDataView({ type, data }: { type: ReportType; data: ReportData }) {
  switch (type) {
    case 'pipeline_health':    return <PipelineView  data={data} />
    case 'braik_outreach':     return <BraikView     data={data} />
    case 'territory_coverage': return <TerritoryView data={data} />
    case 'social_performance': return <SocialView    data={data} />
    case 'api_intelligence':   return <ApiView       data={data} />
    case 'agent_performance':  return <AgentView     data={data} />
  }
}

// ── Report card ───────────────────────────────────────────────────────────────
function ReportCard({
  def, existing,
}: {
  def: typeof REPORT_DEFS[number]
  existing: ReportRecord | null
}) {
  const [report,     setReport]     = useState<ReportRecord | null>(existing)
  const [loading,    setLoading]    = useState(false)
  const [expanded,   setExpanded]   = useState(false)
  const [showData,   setShowData]   = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const color = BRAND_COLOR[def.brand]
  const Icon  = def.icon

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type: def.type, cadence: 'on_demand' }),
      })
      const json = await res.json()
      if (json.id) {
        setReport({ ...json, type: def.type, cadence: 'on_demand', generated_at: new Date().toISOString() } as ReportRecord)
        setExpanded(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={cardRef}
      id={`report-${def.type}`}
      className="card"
      style={{
        padding: 0, overflow: 'hidden',
        borderColor: report?.status === 'ready' ? `color-mix(in srgb, ${color} 30%, var(--card-border))` : undefined,
      }}
    >
      {/* Card header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `color-mix(in srgb, ${color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} style={{ color }} />
          </div>
          <div>
            <p className="font-display" style={{ color: 'var(--ink-primary)', fontSize: 15, letterSpacing: '0.03em' }}>{def.label}</p>
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.3 }}>{def.description}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {report?.status && <StatusBadge status={report.status} />}
          {report?.generated_at && (
            <span style={{ fontSize: 10, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              {new Date(report.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="font-display uppercase"
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
              borderRadius: 6, fontSize: 11, letterSpacing: '0.06em', cursor: loading ? 'wait' : 'pointer',
              background: loading ? 'var(--card-border)' : `color-mix(in srgb, ${color} 12%, transparent)`,
              color: loading ? 'var(--ink-muted)' : color,
              border: `1px solid color-mix(in srgb, ${color} 30%, var(--card-border))`,
              transition: 'all 0.15s',
            }}
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Generating…' : report ? 'Refresh' : 'Generate'}
          </button>
          {report?.status === 'ready' && (
            <>
              <button
                onClick={() => exportPDF(def.type, def.label)}
                className="font-display uppercase"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                  borderRadius: 6, fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer',
                  background: 'transparent', color: 'var(--ink-muted)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <Download size={11} /> PDF
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 4 }}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && report?.status === 'ready' && (
        <div style={{ padding: 16 }}>
          {/* AI Narrative */}
          {report.narrative && (
            <div style={{
              marginBottom: 16, padding: 14, borderRadius: 8,
              background: `color-mix(in srgb, ${color} 5%, var(--body-bg))`,
              border: `1px solid color-mix(in srgb, ${color} 20%, var(--card-border))`,
            }}>
              <p className="font-display uppercase" style={{ color, fontSize: 10, letterSpacing: '0.08em', marginBottom: 8 }}>
                AI Executive Summary
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                {report.narrative}
              </p>
            </div>
          )}

          {/* Data toggle */}
          <button
            onClick={() => setShowData(!showData)}
            className="font-display uppercase"
            style={{
              display: 'flex', alignItems: 'center', gap: 5, marginBottom: showData ? 12 : 0,
              fontSize: 10, letterSpacing: '0.06em', cursor: 'pointer',
              background: 'none', border: 'none', color: 'var(--ink-muted)', padding: 0,
            }}
          >
            {showData ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {showData ? 'Hide' : 'Show'} raw data
          </button>

          {showData && report.data && (
            <ReportDataView type={def.type} data={report.data} />
          )}
        </div>
      )}

      {/* Error state */}
      {report?.status === 'error' && (
        <div style={{ padding: 12, background: '#fef2f2', borderTop: '1px solid #fee2e2' }}>
          <p style={{ fontSize: 12, color: '#dc2626' }}>{report.error ?? 'Unknown error generating report.'}</p>
        </div>
      )}
    </div>
  )
}

// ── Main client ───────────────────────────────────────────────────────────────
export default function ReportsClient({ existing }: { existing: ReportRecord[] }) {
  const [generating, setGenerating] = useState(false)
  const { scope } = useBrandScope()

  const visibleDefs = REPORT_DEFS.filter(def => def.relevantScopes.includes(scope))

  async function generateAll() {
    setGenerating(true)
    await Promise.allSettled(
      REPORT_DEFS.map(def =>
        fetch('/api/reports/generate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ type: def.type, cadence: 'on_demand' }),
        })
      )
    )
    setGenerating(false)
    window.location.reload()
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p className="font-display uppercase" style={{ color: 'var(--apex)', fontSize: 11, letterSpacing: '0.1em' }}>APEX TSG</p>
          <h1 className="font-display" style={{ color: 'var(--ink-primary)', fontSize: 36, lineHeight: 1 }}>REPORTS</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
            On-demand + scheduled intelligence across all business units
          </p>
        </div>
        <button
          onClick={generateAll}
          disabled={generating}
          className="font-display uppercase"
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
            borderRadius: 8, fontSize: 12, letterSpacing: '0.06em', cursor: generating ? 'wait' : 'pointer',
            background: 'var(--apex)', color: '#ffffff', border: 'none', marginTop: 8,
          }}
        >
          <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating all…' : 'Generate all reports'}
        </button>
      </div>

      {/* Report cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visibleDefs.map(def => {
          const latestForType = existing
            .filter(r => r.type === def.type)
            .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())[0] ?? null
          return <ReportCard key={def.type} def={def} existing={latestForType} />
        })}
      </div>
    </div>
  )
}

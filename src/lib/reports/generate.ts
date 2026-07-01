import { createClient } from '@/lib/supabase/server'
import type {
  ReportType, ReportData,
  PipelineReportData, BraikOutreachData, TerritoryData,
  SocialPerformanceData, ApiIntelligenceData, AgentPerformanceData,
} from './types'

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function getWeeklyPeriod(): { start: string; end: string } {
  const end   = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 7)
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
}
export function getMonthlyPeriod(): { start: string; end: string } {
  const end   = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
}

// ─── Pipeline health ──────────────────────────────────────────────────────────
export async function generatePipelineReport(period: { start: string; end: string }): Promise<PipelineReportData> {
  const supabase = await createClient()
  const { data: allLeads } = await supabase.from('leads').select('*')
  const leads = allLeads ?? []

  const newLeads    = leads.filter(l => l.created_at >= period.start)
  const closedWon   = leads.filter(l => l.status === 'closed')
  const closeRate   = leads.length > 0 ? Math.round((closedWon.length / leads.length) * 100) : 0

  const stages = ['open','contacted','proposal','closed'] as const
  const byStage = stages.map(stage => ({
    stage,
    buildvance: leads.filter(l => l.status === stage && l.brand === 'buildvance').length,
    braik:      leads.filter(l => l.status === stage && l.brand === 'braik').length,
  }))

  const sourceMap: Record<string, { count: number; won: number }> = {}
  leads.forEach(l => {
    const s = l.source ?? 'unknown'
    if (!sourceMap[s]) sourceMap[s] = { count: 0, won: 0 }
    sourceMap[s].count++
    if (l.status === 'closed') sourceMap[s].won++
  })
  const bySource = Object.entries(sourceMap).map(([source, v]) => ({ source, ...v }))
    .sort((a, b) => b.count - a.count)

  function brandSummary(brand: string) {
    const bl = leads.filter(l => l.brand === brand)
    const won = bl.filter(l => l.status === 'closed').length
    return {
      total:            bl.length,
      open:             bl.filter(l => l.status === 'open').length,
      contacted:        bl.filter(l => l.status === 'contacted').length,
      proposal:         bl.filter(l => l.status === 'proposal').length,
      closed:           won,
      close_rate_pct:   bl.length > 0 ? Math.round((won / bl.length) * 100) : 0,
    }
  }

  // Weekly velocity — last 4 weeks
  const velocity = Array.from({ length: 4 }, (_, i) => {
    const wEnd   = new Date(); wEnd.setDate(wEnd.getDate() - i * 7)
    const wStart = new Date(); wStart.setDate(wStart.getDate() - (i + 1) * 7)
    const ws = wStart.toISOString().split('T')[0]
    const we = wEnd.toISOString().split('T')[0]
    return {
      week:    ws,
      created: leads.filter(l => l.created_at >= ws && l.created_at <= we).length,
      closed:  leads.filter(l => l.status === 'closed' && l.created_at >= ws && l.created_at <= we).length,
    }
  }).reverse()

  return {
    type: 'pipeline_health',
    period,
    summary: {
      total_leads:       leads.length,
      new_leads:         newLeads.length,
      closed_won:        closedWon.length,
      close_rate_pct:    closeRate,
      avg_days_to_close: 0, // requires created_at + closed_at tracking — placeholder
    },
    by_stage:  byStage,
    by_source: bySource,
    by_brand:  { buildvance: brandSummary('buildvance'), braik: brandSummary('braik') },
    velocity,
  }
}

// ─── Braik outreach ───────────────────────────────────────────────────────────
export async function generateBraikReport(period: { start: string; end: string }): Promise<BraikOutreachData> {
  const supabase = await createClient()
  const { data: targets } = await supabase.from('braik_targets').select('*')
  const t = targets ?? []

  const sent      = t.filter(x => ['outreach_sent','responded','converted'].includes(x.status))
  const responded = t.filter(x => ['responded','converted'].includes(x.status))
  const converted = t.filter(x => x.status === 'converted')

  const statusCounts: Record<string, number> = {}
  t.forEach(x => { statusCounts[x.status] = (statusCounts[x.status] ?? 0) + 1 })

  const stateCounts: Record<string, { count: number; converted: number }> = {}
  t.forEach(x => {
    const s = x.state ?? 'unknown'
    if (!stateCounts[s]) stateCounts[s] = { count: 0, converted: 0 }
    stateCounts[s].count++
    if (x.status === 'converted') stateCounts[s].converted++
  })

  const now = new Date()
  const recent = t
    .filter(x => x.created_at >= period.start)
    .map(x => ({
      school:   x.school_name,
      state:    x.state ?? '—',
      status:   x.status,
      days_ago: Math.floor((now.getTime() - new Date(x.created_at).getTime()) / 86400000),
    }))
    .sort((a, b) => a.days_ago - b.days_ago)
    .slice(0, 10)

  return {
    type: 'braik_outreach',
    period,
    summary: {
      total_targets:       t.length,
      outreach_sent:       sent.length,
      responded:           responded.length,
      converted:           converted.length,
      response_rate_pct:   sent.length > 0 ? Math.round((responded.length / sent.length) * 100) : 0,
      conversion_rate_pct: sent.length > 0 ? Math.round((converted.length / sent.length) * 100) : 0,
    },
    by_status: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    by_state:  Object.entries(stateCounts).map(([state, v]) => ({ state, ...v })).sort((a, b) => b.count - a.count),
    recent_activity: recent,
  }
}

// ─── Territory coverage ───────────────────────────────────────────────────────
export async function generateTerritoryReport(period: { start: string; end: string }): Promise<TerritoryData> {
  const supabase = await createClient()
  const [{ data: leads }, { data: targets }] = await Promise.all([
    supabase.from('leads').select('state, brand'),
    supabase.from('braik_targets').select('state, status'),
  ])

  const leadsByState: Record<string, { count: number; brand: string }> = {}
  ;(leads ?? []).forEach(l => {
    if (!l.state) return
    if (!leadsByState[l.state]) leadsByState[l.state] = { count: 0, brand: l.brand }
    leadsByState[l.state].count++
  })

  const targetsByState: Record<string, { count: number; converted: number }> = {}
  ;(targets ?? []).forEach(t => {
    if (!t.state) return
    if (!targetsByState[t.state]) targetsByState[t.state] = { count: 0, converted: 0 }
    targetsByState[t.state].count++
    if (t.status === 'converted') targetsByState[t.state].converted++
  })

  return {
    type: 'territory_coverage',
    period,
    footholds: [
      { state: 'Florida',     role: 'HQ' },
      { state: 'Ohio',        role: 'Foothold' },
      { state: 'Mississippi', role: 'Foothold' },
    ],
    leads_by_state:   Object.entries(leadsByState).map(([state, v]) => ({ state, ...v })).sort((a, b) => b.count - a.count),
    targets_by_state: Object.entries(targetsByState).map(([state, v]) => ({ state, ...v })).sort((a, b) => b.count - a.count),
    coverage_gaps: ['Texas','Georgia','Tennessee','Alabama','North Carolina'], // seeded — update manually or via API later
  }
}

// ─── Social performance ───────────────────────────────────────────────────────
export async function generateSocialReport(period: { start: string; end: string }): Promise<SocialPerformanceData> {
  const supabase = await createClient()
  const { data: scores } = await supabase
    .from('social_scorecard')
    .select('*')
    .gte('week_of', period.start)
    .order('week_of', { ascending: true })

  const brands = ['apex', 'buildvance', 'braik'] as const
  const byBrand: SocialPerformanceData['by_brand'] = {}

  brands.forEach(brand => {
    const rows = (scores ?? []).filter(s => s.brand === brand)
    if (rows.length === 0) {
      byBrand[brand] = { avg_consistency: null, avg_engagement: null, avg_voice: null, overall_avg: null, trend: 'no_data', weeks_logged: 0 }
      return
    }
    const avg = (key: string) => Math.round(rows.reduce((s, r) => s + (r[key] ?? 0), 0) / rows.length)
    const c = avg('consistency_score')
    const e = avg('engagement_quality_score')
    const v = avg('brand_voice_score')
    const overall = Math.round((c + e + v) / 3)

    let trend: 'up' | 'down' | 'flat' = 'flat'
    if (rows.length >= 2) {
      const first = (rows[0].consistency_score + rows[0].engagement_quality_score + rows[0].brand_voice_score) / 3
      const last  = (rows[rows.length - 1].consistency_score + rows[rows.length - 1].engagement_quality_score + rows[rows.length - 1].brand_voice_score) / 3
      trend = last > first + 0.5 ? 'up' : last < first - 0.5 ? 'down' : 'flat'
    }
    byBrand[brand] = { avg_consistency: c, avg_engagement: e, avg_voice: v, overall_avg: overall, trend, weeks_logged: rows.length }
  })

  const history = (scores ?? []).map(s => ({
    week_of: s.week_of,
    brand:   s.brand,
    avg:     Math.round(((s.consistency_score ?? 0) + (s.engagement_quality_score ?? 0) + (s.brand_voice_score ?? 0)) / 3),
  }))

  return { type: 'social_performance', period, by_brand: byBrand, scorecard_history: history }
}

// ─── API intelligence ─────────────────────────────────────────────────────────
export async function generateApiReport(period: { start: string; end: string }): Promise<ApiIntelligenceData> {
  const supabase = await createClient()
  const { data: competitors } = await supabase.from('competitors').select('name, brand, website, last_reviewed, positioning_notes')

  const integrations = [
    { name: 'GitHub',      env_var: 'GITHUB_TOKEN',       connected: !!process.env.GITHUB_TOKEN },
    { name: 'Meta',        env_var: 'META_ACCESS_TOKEN',  connected: !!process.env.META_ACCESS_TOKEN },
    { name: 'Gmail',       env_var: 'GOOGLE_REFRESH_TOKEN', connected: !!process.env.GOOGLE_REFRESH_TOKEN },
    { name: 'Hunter.io',   env_var: 'HUNTER_API_KEY',     connected: !!process.env.HUNTER_API_KEY },
    { name: 'Anthropic',   env_var: 'ANTHROPIC_API_KEY',  connected: !!process.env.ANTHROPIC_API_KEY },
    { name: 'Google Cal',  env_var: 'GOOGLE_CLIENT_ID',   connected: !!process.env.GOOGLE_CLIENT_ID },
  ]

  return {
    type: 'api_intelligence',
    period,
    competitor_snapshots: (competitors ?? []).map(c => ({
      name:          c.name,
      brand:         c.brand,
      website:       c.website,
      last_reviewed: c.last_reviewed,
      notes:         c.positioning_notes,
    })),
    hunter_usage:         null, // placeholder — Hunter API returns usage stats on paid plans
    integrations_status:  integrations,
  }
}

// ─── Agent performance ────────────────────────────────────────────────────────
export async function generateAgentReport(period: { start: string; end: string }): Promise<AgentPerformanceData> {
  // Agent tracking table doesn't exist yet — returns structured empty state
  // so the report page renders correctly and the data model is established.
  // When agents are built, insert rows into `agent_runs` with this shape:
  // { agent_id, agent_name, type, brand, success, tokens_used, cost_usd, outcome_label, ran_at }
  return {
    type: 'agent_performance',
    period,
    agents: [],
    summary: { total_runs: 0, total_cost_usd: 0, avg_success_rate: 0 },
  }
}

// ─── Master generator ─────────────────────────────────────────────────────────
export async function generateReport(type: ReportType, period: { start: string; end: string }): Promise<ReportData> {
  switch (type) {
    case 'pipeline_health':    return generatePipelineReport(period)
    case 'braik_outreach':     return generateBraikReport(period)
    case 'territory_coverage': return generateTerritoryReport(period)
    case 'social_performance': return generateSocialReport(period)
    case 'api_intelligence':   return generateApiReport(period)
    case 'agent_performance':  return generateAgentReport(period)
  }
}

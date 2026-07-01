// ─── Report system types ───────────────────────────────────────────────────

export type ReportType =
  | 'pipeline_health'
  | 'braik_outreach'
  | 'territory_coverage'
  | 'social_performance'
  | 'api_intelligence'
  | 'agent_performance'

export type ReportCadence = 'weekly' | 'monthly' | 'on_demand'
export type ReportStatus  = 'pending' | 'generating' | 'ready' | 'error'

// What gets stored in the reports table per generated report
export interface ReportRecord {
  id:            string
  type:          ReportType
  cadence:       ReportCadence
  status:        ReportStatus
  generated_at:  string
  period_start:  string
  period_end:    string
  data:          ReportData
  narrative:     string | null   // Claude-written summary
  error:         string | null
}

// Union of all possible data shapes
export type ReportData =
  | PipelineReportData
  | BraikOutreachData
  | TerritoryData
  | SocialPerformanceData
  | ApiIntelligenceData
  | AgentPerformanceData

// ── Pipeline health ──────────────────────────────────────────────────────────
export interface PipelineReportData {
  type: 'pipeline_health'
  period: { start: string; end: string }
  summary: {
    total_leads:         number
    new_leads:           number
    closed_won:          number
    close_rate_pct:      number
    avg_days_to_close:   number
  }
  by_stage: Array<{ stage: string; buildvance: number; braik: number }>
  by_source: Array<{ source: string; count: number; won: number }>
  by_brand: { buildvance: PipelineBrandSummary; braik: PipelineBrandSummary }
  velocity: Array<{ week: string; created: number; closed: number }>
}
export interface PipelineBrandSummary {
  total: number; open: number; contacted: number; proposal: number; closed: number
  close_rate_pct: number
}

// ── Braik outreach ───────────────────────────────────────────────────────────
export interface BraikOutreachData {
  type: 'braik_outreach'
  period: { start: string; end: string }
  summary: {
    total_targets:    number
    outreach_sent:    number
    responded:        number
    converted:        number
    response_rate_pct:   number
    conversion_rate_pct: number
  }
  by_status: Array<{ status: string; count: number }>
  by_state:  Array<{ state: string; count: number; converted: number }>
  recent_activity: Array<{ school: string; state: string; status: string; days_ago: number }>
}

// ── Territory coverage ────────────────────────────────────────────────────────
export interface TerritoryData {
  type: 'territory_coverage'
  period: { start: string; end: string }
  footholds: Array<{ state: string; role: string }>
  leads_by_state:   Array<{ state: string; count: number; brand: string }>
  targets_by_state: Array<{ state: string; count: number; converted: number }>
  coverage_gaps: string[]   // states with 0 presence but high potential (manual for now)
}

// ── Social performance ────────────────────────────────────────────────────────
export interface SocialPerformanceData {
  type: 'social_performance'
  period: { start: string; end: string }
  by_brand: Record<string, {
    avg_consistency:  number | null
    avg_engagement:   number | null
    avg_voice:        number | null
    overall_avg:      number | null
    trend:            'up' | 'down' | 'flat' | 'no_data'
    weeks_logged:     number
  }>
  scorecard_history: Array<{ week_of: string; brand: string; avg: number }>
}

// ── API intelligence ──────────────────────────────────────────────────────────
export interface ApiIntelligenceData {
  type: 'api_intelligence'
  period: { start: string; end: string }
  competitor_snapshots: Array<{
    name:       string
    brand:      string
    website:    string | null
    last_reviewed: string | null
    notes:      string | null
  }>
  hunter_usage: { searches_used: number; searches_limit: number } | null
  integrations_status: Array<{ name: string; connected: boolean; env_var: string }>
}

// ── Agent performance ─────────────────────────────────────────────────────────
// Data model ready for future agents — currently shows empty/placeholder state
export interface AgentPerformanceData {
  type: 'agent_performance'
  period: { start: string; end: string }
  agents: Array<{
    id:              string
    name:            string
    type:            'outreach' | 'enrichment' | 'content' | 'research'
    brand:           string
    runs:            number
    successes:       number
    failures:        number
    avg_tokens_used: number
    total_cost_usd:  number
    last_run:        string | null
    outcomes:        Array<{ label: string; count: number }>
  }>
  summary: {
    total_runs:      number
    total_cost_usd:  number
    avg_success_rate: number
  }
}

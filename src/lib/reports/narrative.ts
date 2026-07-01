import type { ReportData, ReportType } from './types'

// ─── Build a compact JSON summary for Claude (not raw DB rows) ────────────────
function summarizeForClaude(type: ReportType, data: ReportData): string {
  switch (type) {
    case 'pipeline_health': {
      const d = data as import('./types').PipelineReportData
      return JSON.stringify({
        total_leads: d.summary.total_leads,
        new_this_period: d.summary.new_leads,
        close_rate_pct: d.summary.close_rate_pct,
        buildvance: d.by_brand.buildvance,
        braik: d.by_brand.braik,
        top_sources: d.by_source.slice(0, 3),
        stage_breakdown: d.by_stage,
      })
    }
    case 'braik_outreach': {
      const d = data as import('./types').BraikOutreachData
      return JSON.stringify({
        total_targets: d.summary.total_targets,
        outreach_sent: d.summary.outreach_sent,
        response_rate_pct: d.summary.response_rate_pct,
        conversion_rate_pct: d.summary.conversion_rate_pct,
        top_states: d.by_state.slice(0, 5),
        status_breakdown: d.by_status,
      })
    }
    case 'territory_coverage': {
      const d = data as import('./types').TerritoryData
      return JSON.stringify({
        footholds: d.footholds,
        top_lead_states: d.leads_by_state.slice(0, 5),
        top_braik_states: d.targets_by_state.slice(0, 5),
        coverage_gaps: d.coverage_gaps,
      })
    }
    case 'social_performance': {
      const d = data as import('./types').SocialPerformanceData
      return JSON.stringify({ by_brand: d.by_brand })
    }
    case 'api_intelligence': {
      const d = data as import('./types').ApiIntelligenceData
      return JSON.stringify({
        integrations_connected: d.integrations_status.filter(i => i.connected).map(i => i.name),
        integrations_missing: d.integrations_status.filter(i => !i.connected).map(i => i.name),
        competitors_tracked: d.competitor_snapshots.length,
        stale_competitors: d.competitor_snapshots.filter(c => {
          if (!c.last_reviewed) return true
          const days = (Date.now() - new Date(c.last_reviewed).getTime()) / 86400000
          return days > 30
        }).map(c => c.name),
      })
    }
    case 'agent_performance': {
      const d = data as import('./types').AgentPerformanceData
      return JSON.stringify({ agents: d.agents.length, summary: d.summary })
    }
  }
}

const REPORT_PROMPTS: Record<ReportType, string> = {
  pipeline_health: `You are analyzing the sales pipeline for Apex Technical Solutions Group (Apex TSG), 
a 2-person custom software shop in Tampa Bay FL. They have two ventures: Buildvance (custom software for trades like plumbers/HVAC) 
and Braik.io (sports program management SaaS for high school football programs). 
Write a 3-paragraph executive summary covering: (1) overall pipeline health and what the numbers mean for a 2-person shop, 
(2) how Buildvance and Braik compare and which needs more attention, 
(3) the single most important action they should take this week based on this data. 
Be direct and specific — no filler, no corporate language. Treat them like a smart founder who wants honest advice.`,

  braik_outreach: `You are analyzing Braik.io's school outreach pipeline for Apex TSG. 
Braik.io targets high school athletic directors and football coaches, replacing no-system chaos (whiteboards/spreadsheets). 
Write a 3-paragraph summary covering: (1) the overall funnel health and where schools are dropping off, 
(2) geographic patterns in state data and what they suggest about targeting strategy, 
(3) one specific tactic to improve response rate this week. Be concise and coach-minded in tone.`,

  territory_coverage: `You are analyzing the geographic coverage for Apex TSG. 
They have physical footholds in Florida (HQ), Ohio, and Mississippi. 
Write a 3-paragraph summary covering: (1) how well current lead/target geography aligns with their footholds, 
(2) whether the identified coverage gap states are worth pursuing and why, 
(3) a specific territory expansion recommendation for the next 30 days. Be strategic and practical.`,

  social_performance: `You are analyzing social media performance across three brands for Apex TSG: 
Apex TSG (company brand), Buildvance (custom software), and Braik.io (sports SaaS). 
Write a 3-paragraph summary covering: (1) which brand is performing best and worst, 
(2) what the score trends mean for their overall content strategy, 
(3) two specific content actions for the lowest-performing brand this week. Be specific with ideas.`,

  api_intelligence: `You are analyzing the integration and competitive intelligence status for Apex TSG. 
Write a 3-paragraph summary covering: (1) which missing integrations are costing them the most (rank by business impact), 
(2) the state of their competitor tracking and whether they're staying sharp on their competitive position, 
(3) the single highest-ROI integration to prioritize connecting this week. Be opinionated.`,

  agent_performance: `You are analyzing AI agent and automation performance for Apex TSG. 
Write a 3-paragraph summary covering: (1) current state of automation in their workflow, 
(2) which agent types would have the highest impact for a 2-person software shop at their stage, 
(3) a specific recommendation for the first agent or automation to build. 
Note: agent data may be empty if no agents are deployed yet — address that case directly.`,
}

// ─── Generate Claude narrative ─────────────────────────────────────────────────
export async function generateNarrative(type: ReportType, data: ReportData): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return 'Connect your Anthropic API key in Settings to enable AI narrative summaries.'

  const systemPrompt = REPORT_PROMPTS[type]
  const dataSummary  = summarizeForClaude(type, data)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 600,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: `Report data: ${dataSummary}` }],
      }),
    })

    const json = await response.json()
    return json.content?.[0]?.text ?? 'Unable to generate narrative.'
  } catch {
    return 'Unable to generate narrative — check your Anthropic API key.'
  }
}

import {
  getPipelineByStage, getRecentActivity, getUpcomingEvents,
  getProjects, getLeadsWithCoords, getBraikTargetsWithCoords,
  getAllLeadsBasic, getSocialScoresByBrand,
} from '@/lib/queries/dashboard'
import DashboardScopedView from './DashboardScopedView'

export const metadata = { title: 'Dashboard — Apex Workspace' }
export const dynamic  = 'force-dynamic'

// ── All data fetched ONCE server-side, regardless of brand scope ───────────
// DashboardScopedView (client component) filters/reshapes this instantly
// when the user clicks a logo — no refetch, no reload, real-time switching.

export default async function DashboardPage() {
  const [
    leads, pipeline, activity, events,
    projects, mapLeads, mapTargets, socialScores,
  ] = await Promise.all([
    getAllLeadsBasic(),
    getPipelineByStage(),
    getRecentActivity(),
    getUpcomingEvents(),
    getProjects(),
    getLeadsWithCoords(),
    getBraikTargetsWithCoords(),
    getSocialScoresByBrand(),
  ])

  return (
    <DashboardScopedView
      leads={leads}
      pipeline={pipeline}
      activity={activity}
      events={events}
      projects={projects}
      mapLeads={mapLeads.map(l => ({ id: l.id, lat: Number(l.lat), lng: Number(l.lng), brand: l.brand }))}
      mapTargets={mapTargets.map(t => ({ id: t.id, lat: Number(t.lat), lng: Number(t.lng) }))}
      socialScores={socialScores}
    />
  )
}

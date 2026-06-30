import { createClient } from '@/lib/supabase/server'

export async function getOpenLeadsCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')
  return count ?? 0
}

export async function getProjectsByBrand() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('brand, status')
  if (!data) return { buildvance: 0, braik: 0 }
  return {
    buildvance: data.filter((p) => p.brand === 'buildvance' && p.status === 'active').length,
    braik: data.filter((p) => p.brand === 'braik' && p.status === 'active').length,
  }
}

export async function getPipelineByStage() {
  const supabase = await createClient()
  const { data } = await supabase.from('leads').select('brand, status')
  const stages = ['open', 'contacted', 'proposal', 'closed'] as const
  return stages.map((stage) => ({
    stage,
    buildvance: data?.filter((l) => l.status === stage && l.brand === 'buildvance').length ?? 0,
    braik: data?.filter((l) => l.status === stage && l.brand === 'braik').length ?? 0,
  }))
}

export async function getRecentActivity() {
  const supabase = await createClient()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const since = new Date()
  since.setDate(since.getDate() - 6)
  since.setHours(0, 0, 0, 0)

  const [{ data: leads }, { data: projects }] = await Promise.all([
    supabase
      .from('leads')
      .select('brand, created_at')
      .gte('created_at', since.toISOString()),
    supabase
      .from('projects')
      .select('brand, last_updated')
      .gte('last_updated', since.toISOString()),
  ])

  return days.map((day) => ({
    day,
    buildvance:
      (leads?.filter((l) => l.brand === 'buildvance' && l.created_at.startsWith(day)).length ?? 0) +
      (projects?.filter((p) => p.brand === 'buildvance' && p.last_updated?.startsWith(day)).length ?? 0),
    braik:
      (leads?.filter((l) => l.brand === 'braik' && l.created_at.startsWith(day)).length ?? 0) +
      (projects?.filter((p) => p.brand === 'braik' && p.last_updated?.startsWith(day)).length ?? 0),
  }))
}

export async function getSocialScore() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('social_scorecard')
    .select('consistency_score, engagement_quality_score, brand_voice_score')
    .order('week_of', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  const avg = Math.round(
    ((data.consistency_score ?? 0) +
      (data.engagement_quality_score ?? 0) +
      (data.brand_voice_score ?? 0)) /
      3
  )
  return Math.round((avg / 10) * 100)
}

export async function getCloseRate() {
  const supabase = await createClient()
  const [{ count: total }, { count: closed }] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
  ])
  if (!total) return 0
  return Math.round(((closed ?? 0) / total) * 100)
}

export async function getUpcomingEvents() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('calendar_events')
    .select('id, title, start_time, brand')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5)
  return data ?? []
}

export async function getProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('id, name, brand, status')
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getLeadsWithCoords() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leads')
    .select('id, name, lat, lng, brand')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
  return data ?? []
}

export async function getBraikTargetsWithCoords() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('braik_targets')
    .select('id, school_name, lat, lng')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
  return data ?? []
}

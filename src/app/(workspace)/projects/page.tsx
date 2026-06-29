import { createClient } from '@/lib/supabase/server'
import { fetchRepoData } from '@/app/actions/github'
import ProjectsClient from './ProjectsClient'

export const metadata = { title: 'Projects — Apex Workspace' }

const SEED_PROJECTS = [
  {
    name: 'Heather Thrifty Vintage',
    client: 'Heather',
    status: 'active' as const,
    github_repo: null,
    last_updated: new Date().toISOString(),
  },
  {
    name: 'Menlo Atherton Glass Co.',
    client: 'Menlo Atherton Glass',
    status: 'active' as const,
    github_repo: null,
    last_updated: new Date().toISOString(),
  },
  {
    name: 'Braik.io',
    client: 'Internal',
    status: 'active' as const,
    github_repo: null,
    last_updated: new Date().toISOString(),
  },
]

export default async function ProjectsPage() {
  const supabase = await createClient()

  let { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false })

  if (!projects || projects.length === 0) {
    await supabase.from('projects').insert(SEED_PROJECTS)
    const { data: seeded } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    projects = seeded ?? []
  }

  const githubData = await Promise.all(
    (projects ?? []).map(async (p) => {
      if (!p.github_repo) return null
      return fetchRepoData(p.github_repo)
    })
  )

  return <ProjectsClient projects={projects ?? []} githubData={githubData} />
}

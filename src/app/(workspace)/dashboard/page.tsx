/*
 * Supabase tables needed (run in Supabase SQL editor):
 *
 * -- leads: id, name, company, email, status (open/contacted/proposal/closed), source, notes, created_at
 * -- projects: id, name, client, status (active/paused/completed), github_repo, last_updated, created_at
 *
 * See DEPLOYMENT.md for full CREATE TABLE SQL.
 */

import { createClient } from '@/lib/supabase/server'
import {
  Users,
  FolderKanban,
  Mail,
  GitCommit,
  BarChart2,
} from 'lucide-react'

export const metadata = { title: 'Dashboard — Apex Workspace' }

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  note?: string
}

function StatCard({ icon, value, label, note }: StatCardProps) {
  return (
    <div
      className="rounded-lg border p-5 flex flex-col gap-3"
      style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
    >
      <div style={{ color: '#3B82F6', opacity: 0.7 }}>{icon}</div>
      <div>
        <p
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'monospace' }}
        >
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
          {label}
        </p>
      </div>
      {note && (
        <span
          className="self-start text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: '#451a03', color: '#f59e0b' }}
        >
          {note}
        </span>
      )}
    </div>
  )
}

const statusColors: Record<string, string> = {
  open: '#3B82F6',
  contacted: '#f59e0b',
  proposal: '#a855f7',
  closed: '#22c55e',
  active: '#22c55e',
  paused: '#f59e0b',
  completed: '#6b7280',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: openLeads }, { data: recentLeads }, { count: activeProjects }, { data: recentProjects }] =
    await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('leads').select('id, name, company, status, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('projects').select('id, name, status, last_updated').order('last_updated', { ascending: false }).limit(5),
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-lg font-bold text-white"
          style={{ fontFamily: 'monospace' }}
        >
          Dashboard
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
          Business health at a glance
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={<Users size={18} />} value={openLeads ?? 0} label="Open Leads" />
        <StatCard icon={<FolderKanban size={18} />} value={activeProjects ?? 0} label="Active Projects" />
        <StatCard icon={<Mail size={18} />} value="—" label="Unread Emails" note="Connect Gmail" />
        <StatCard icon={<GitCommit size={18} />} value="—" label="GitHub Commits (7d)" note="Connect GitHub" />
        <StatCard icon={<BarChart2 size={18} />} value="—" label="Social Reach (7d)" note="Connect Meta" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
        >
          <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'monospace' }}>
            Recent Pipeline Activity
          </h2>
          {recentLeads && recentLeads.length > 0 ? (
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: '#1e2330' }}
                >
                  <div>
                    <p className="text-sm text-white">{lead.name}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{lead.company ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{
                        backgroundColor: `${statusColors[lead.status] ?? '#6b7280'}22`,
                        color: statusColors[lead.status] ?? '#6b7280',
                      }}
                    >
                      {lead.status}
                    </span>
                    <span className="text-xs" style={{ color: '#6b7280' }}>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs py-8 text-center" style={{ color: '#6b7280' }}>
              No data yet — add your first entry
            </p>
          )}
        </div>

        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
        >
          <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'monospace' }}>
            Project Status
          </h2>
          {recentProjects && recentProjects.length > 0 ? (
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: '#1e2330' }}
                >
                  <p className="text-sm text-white">{project.name}</p>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{
                        backgroundColor: `${statusColors[project.status] ?? '#6b7280'}22`,
                        color: statusColors[project.status] ?? '#6b7280',
                      }}
                    >
                      {project.status}
                    </span>
                    <span className="text-xs" style={{ color: '#6b7280' }}>
                      {new Date(project.last_updated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs py-8 text-center" style={{ color: '#6b7280' }}>
              No data yet — add your first entry
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

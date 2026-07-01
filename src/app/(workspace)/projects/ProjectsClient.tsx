'use client'

import { useState } from 'react'
import { Plus, X, GitBranch, AlertCircle, GitPullRequest, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { GitHubRepoData } from '@/app/actions/github'
import { toast } from 'sonner'
import { useAssistant } from '@/lib/assistant-context'

type ProjectStatus = 'active' | 'paused' | 'completed'

interface Project {
  id: string
  name: string
  client: string | null
  status: ProjectStatus
  github_repo: string | null
  last_updated: string
  created_at: string
}

const statusColors: Record<ProjectStatus, string> = {
  active: '#22c55e',
  paused: '#f59e0b',
  completed: '#6b7280',
}

interface ProjectModalProps {
  project?: Project
  onClose: () => void
  onSave: (data: Partial<Project>) => Promise<void>
}

function ProjectModal({ project, onClose, onSave }: ProjectModalProps) {
  const [form, setForm] = useState({
    name: project?.name ?? '',
    client: project?.client ?? '',
    status: project?.status ?? 'active',
    github_repo: project?.github_repo ?? '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      ...form,
      github_repo: form.github_repo || null,
      client: form.client || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="w-full max-w-md rounded-lg border p-6 space-y-4"
        style={{ backgroundColor: '#13161f', borderColor: '#1e2330' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>
            {project ? 'Edit Project' : 'Add Project'}
          </h2>
          <button onClick={onClose} style={{ color: '#6b7280' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: 'Project Name *', key: 'name', required: true, placeholder: '' },
            { label: 'Client', key: 'client', required: false, placeholder: '' },
            { label: 'GitHub Repo', key: 'github_repo', required: false, placeholder: 'owner/repo-name' },
          ].map(({ label, key, required, placeholder }) => (
            <div key={key}>
              <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>{label}</label>
              <input
                type="text"
                required={required}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded border text-sm text-white outline-none focus:border-blue-500"
                style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
              />
            </div>
          ))}

          <div>
            <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
              className="w-full px-3 py-2 rounded border text-sm text-white outline-none"
              style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 rounded text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: '#3B82F6' }}
          >
            {saving ? 'Saving…' : project ? 'Save Changes' : 'Add Project'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsClient({
  projects: initialProjects,
  githubData,
}: {
  projects: Project[]
  githubData: (GitHubRepoData | null)[]
}) {
  const supabase = createClient()
  const { logAction } = useAssistant()
  const [projects, setProjects] = useState(initialProjects)
  const [ghData, setGhData] = useState(githubData)
  const [modal, setModal] = useState<{ open: boolean; project?: Project }>({ open: false })

  async function handleSave(data: Partial<Project>) {
    if (modal.project) {
      const { data: updated } = await supabase
        .from('projects')
        .update({ ...data, last_updated: new Date().toISOString() })
        .eq('id', modal.project.id)
        .select()
        .single()
      if (updated) {
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        logAction({ description: `Updated project '${updated.name}' status to ${updated.status}`, page: '/projects', brand: null })
        toast.success('Project saved')
      }
    } else {
      const { data: inserted } = await supabase
        .from('projects')
        .insert({ ...data, last_updated: new Date().toISOString() })
        .select()
        .single()
      if (inserted) {
        setProjects((prev) => [inserted, ...prev])
        setGhData((prev) => [null, ...prev])
        logAction({ description: `Added new project '${inserted.name}'`, page: '/projects', brand: null })
        toast.success('Project added')
      }
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'monospace' }}>Projects</h1>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium text-white"
          style={{ backgroundColor: '#3B82F6' }}
        >
          <Plus size={14} /> Add Project
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project, i) => {
          const gh = ghData[i]
          return (
            <div
              key={project.id}
              className="rounded-lg border p-5 space-y-4"
              style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-white">{project.name}</h2>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{
                        backgroundColor: `${statusColors[project.status]}22`,
                        color: statusColors[project.status],
                      }}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                    Client: {project.client ?? '—'}
                  </p>
                </div>
                <button
                  onClick={() => setModal({ open: true, project })}
                  className="text-xs px-2 py-1 rounded border transition-colors"
                  style={{ borderColor: '#1e2330', color: '#6b7280' }}
                >
                  Edit
                </button>
              </div>

              {project.github_repo ? (
                gh ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded p-3 text-center" style={{ backgroundColor: '#0f1117' }}>
                      <Clock size={13} className="mx-auto mb-1" style={{ color: '#6b7280' }} />
                      <p className="text-xs text-white font-medium">{new Date(gh.lastPushDate).toLocaleDateString()}</p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>Last push</p>
                    </div>
                    <div className="rounded p-3 text-center" style={{ backgroundColor: '#0f1117' }}>
                      <AlertCircle size={13} className="mx-auto mb-1" style={{ color: '#6b7280' }} />
                      <p className="text-xs text-white font-medium">{gh.openIssues}</p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>Open issues</p>
                    </div>
                    <div className="rounded p-3 text-center" style={{ backgroundColor: '#0f1117' }}>
                      <GitPullRequest size={13} className="mx-auto mb-1" style={{ color: '#6b7280' }} />
                      <p className="text-xs text-white font-medium">{gh.openPRs}</p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>Open PRs</p>
                    </div>
                    <div className="rounded p-3" style={{ backgroundColor: '#0f1117' }}>
                      <p className="text-xs" style={{ color: '#6b7280' }}>Last commit</p>
                      <p className="text-xs text-white mt-0.5 truncate">{gh.commits[0]?.message ?? '—'}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{gh.commits[0]?.author}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <GitBranch size={13} style={{ color: '#6b7280' }} />
                    <span className="text-xs" style={{ color: '#6b7280' }}>{project.github_repo}</span>
                    <span className="text-xs" style={{ color: '#f59e0b' }}>— could not fetch GitHub data</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#6b7280' }}>No repo linked</span>
                  <button
                    onClick={() => setModal({ open: true, project })}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: '#1e2330', color: '#3B82F6' }}
                  >
                    Link repo
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {projects.length === 0 && (
          <p className="text-center py-16 text-sm" style={{ color: '#6b7280' }}>
            No projects yet — add your first project
          </p>
        )}
      </div>

      {modal.open && (
        <ProjectModal
          project={modal.project}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}
    </>
  )
}

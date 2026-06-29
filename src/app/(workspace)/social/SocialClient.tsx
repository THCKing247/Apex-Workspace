'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { MetaPageData } from '@/app/actions/meta'

interface PageConfig {
  id: string
  label: string
  pageId: string
}

interface Props {
  pages: PageConfig[]
  pageData: (MetaPageData | null)[]
  connected: boolean
}

function SetupModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="w-full max-w-lg rounded-lg border p-6 space-y-4"
        style={{ backgroundColor: '#13161f', borderColor: '#1e2330' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>
            Connect Meta API
          </h2>
          <button onClick={onClose} style={{ color: '#6b7280' }}><X size={16} /></button>
        </div>
        <ol className="space-y-3 text-sm" style={{ color: '#9ca3af' }}>
          <li><span className="text-white font-medium">1.</span> Go to <strong className="text-blue-400">Meta Business Suite → Business Settings → System Users</strong></li>
          <li><span className="text-white font-medium">2.</span> Create or select a System User and click <strong className="text-white">Generate New Token</strong></li>
          <li><span className="text-white font-medium">3.</span> Select your pages and enable <strong className="text-white">pages_read_engagement</strong> and <strong className="text-white">read_insights</strong> permissions</li>
          <li><span className="text-white font-medium">4.</span> Copy the token to <code className="text-blue-400 bg-blue-950/30 px-1 rounded">META_ACCESS_TOKEN</code> in <code className="text-blue-400">.env.local</code></li>
          <li><span className="text-white font-medium">5.</span> Add your page IDs from each page&apos;s About section to <code className="text-blue-400">META_PAGE_ID_APEX</code>, etc.</li>
        </ol>
      </div>
    </div>
  )
}

export default function SocialClient({ pages, pageData, connected }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const [showSetup, setShowSetup] = useState(false)

  const current = pageData[activeTab]

  const statItems = [
    { label: 'Weekly Reach', value: current?.insights.impressions },
    { label: 'Engaged Users', value: current?.insights.engagedUsers },
    { label: 'Total Followers', value: current?.insights.fans },
    { label: 'Page Views', value: current?.insights.pageViews },
  ]

  const chartData = current?.posts.map((p, i) => ({
    name: `Post ${i + 1}`,
    likes: p.likes,
    comments: p.comments,
  })) ?? []

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'monospace' }}>Social</h1>
      </div>

      {!connected && (
        <div
          className="flex items-center gap-3 rounded-lg border p-4 mb-6"
          style={{ backgroundColor: '#1a1400', borderColor: '#f59e0b44' }}
        >
          <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
          <p className="text-sm" style={{ color: '#f59e0b' }}>
            Meta API not connected — add your{' '}
            <code className="text-xs bg-yellow-950/40 px-1 rounded">META_ACCESS_TOKEN</code> to{' '}
            <code className="text-xs bg-yellow-950/40 px-1 rounded">.env.local</code>
          </p>
          <button
            onClick={() => setShowSetup(true)}
            className="ml-auto text-xs px-3 py-1.5 rounded font-medium"
            style={{ backgroundColor: '#f59e0b', color: '#000' }}
          >
            View Setup Instructions
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: '#1e2330' }}>
        {pages.map((page, i) => (
          <button
            key={page.id}
            onClick={() => setActiveTab(i)}
            className="px-4 py-2 text-sm transition-colors"
            style={{
              color: activeTab === i ? '#3B82F6' : '#6b7280',
              borderBottom: activeTab === i ? '2px solid #3B82F6' : '2px solid transparent',
              fontFamily: 'monospace',
            }}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statItems.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border p-4"
            style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
          >
            <p
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'monospace' }}
            >
              {value !== null && value !== undefined ? value.toLocaleString() : '—'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div
          className="rounded-lg border p-5 mb-6"
          style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
        >
          <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'monospace' }}>
            Recent Post Engagement
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f1117', border: '1px solid #1e2330', borderRadius: 6 }}
                labelStyle={{ color: '#fff', fontSize: 12 }}
                itemStyle={{ color: '#9ca3af', fontSize: 11 }}
              />
              <Bar dataKey="likes" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="comments" fill="#a855f7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Posts table */}
      <div
        className="rounded-lg border"
        style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: '#1e2330' }}>
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>
            Recent Posts
          </h2>
        </div>
        {current?.posts && current.posts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2330' }}>
                {['Post', 'Date', 'Likes', 'Comments'].map((h) => (
                  <th key={h} className="text-left px-5 py-2 text-xs font-medium" style={{ color: '#6b7280' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current.posts.map((post) => (
                <tr key={post.id} style={{ borderBottom: '1px solid #1e2330' }}>
                  <td className="px-5 py-3 text-white" style={{ maxWidth: 300 }}>
                    <span className="line-clamp-2">{post.message.slice(0, 80)}{post.message.length > 80 ? '…' : ''}</span>
                  </td>
                  <td className="px-5 py-3 text-xs whitespace-nowrap" style={{ color: '#6b7280' }}>
                    {new Date(post.created_time).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: '#3B82F6' }}>{post.likes}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: '#a855f7' }}>{post.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-8 text-sm text-center" style={{ color: '#6b7280' }}>
            {connected ? 'No posts found for this page' : 'Connect Meta to see posts'}
          </p>
        )}
      </div>

      {showSetup && <SetupModal onClose={() => setShowSetup(false)} />}
    </>
  )
}

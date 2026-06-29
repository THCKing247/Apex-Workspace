'use client'

/*
 * To get GOOGLE_REFRESH_TOKEN:
 * Use Google OAuth Playground (https://developers.google.com/oauthplayground) with Gmail readonly scope,
 * exchange for refresh token, add to .env.local
 */

import { useState, useEffect, useMemo } from 'react'
import { Search, ExternalLink, RefreshCw, AlertTriangle, Mail, PenSquare } from 'lucide-react'
import type { GmailMessage } from '@/lib/gmail'

type FilterTab = 'all' | 'client' | 'braik' | 'buildvance'

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'client', label: 'Client Threads' },
  { id: 'braik', label: 'Braik' },
  { id: 'buildvance', label: 'Buildvance' },
]

export default function InboxPage() {
  const [messages, setMessages] = useState<GmailMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  async function fetchMessages() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gmail')
      const data = await res.json()
      if (data.error && !data.messages?.length) {
        setError(data.error)
      } else {
        setMessages(data.messages ?? [])
      }
    } catch {
      setError('Failed to load inbox')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMessages() }, [])

  const filtered = useMemo(() => {
    let list = messages

    if (activeTab === 'braik') {
      list = list.filter((m) => m.from.toLowerCase().includes('braik') || m.subject.toLowerCase().includes('braik'))
    } else if (activeTab === 'buildvance') {
      list = list.filter((m) => m.from.toLowerCase().includes('buildvance') || m.subject.toLowerCase().includes('buildvance'))
    } else if (activeTab === 'client') {
      list = list.filter((m) => m.subject.toLowerCase().includes('project') || m.from.includes('@gmail.com'))
    }

    if (unreadOnly) list = list.filter((m) => m.isUnread)

    if (search) {
      const q = search.toLowerCase()
      list = list.filter((m) => m.subject.toLowerCase().includes(q) || m.from.toLowerCase().includes(q))
    }

    return list
  }, [messages, search, unreadOnly, activeTab])

  const selected = messages.find((m) => m.id === selectedId)

  const isConfigured = !error?.includes('not configured')

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'monospace' }}>Inbox</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMessages}
            className="p-1.5 rounded border transition-colors"
            style={{ borderColor: '#1e2330', color: '#6b7280' }}
          >
            <RefreshCw size={13} />
          </button>
          <a
            href="https://mail.google.com/mail/u/0/#compose"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium text-white"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <PenSquare size={13} /> Compose
          </a>
        </div>
      </div>

      {!isConfigured && (
        <div
          className="flex items-center gap-3 rounded-lg border p-4 mb-4"
          style={{ backgroundColor: '#1a1400', borderColor: '#f59e0b44' }}
        >
          <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
          <div className="text-sm">
            <p style={{ color: '#f59e0b' }}>Gmail not configured</p>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
              Add <code className="bg-yellow-950/40 px-1 rounded">GOOGLE_CLIENT_ID</code>,{' '}
              <code className="bg-yellow-950/40 px-1 rounded">GOOGLE_CLIENT_SECRET</code>, and{' '}
              <code className="bg-yellow-950/40 px-1 rounded">GOOGLE_REFRESH_TOKEN</code> to your{' '}
              <code className="bg-yellow-950/40 px-1 rounded">.env.local</code>
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center gap-2 flex-1 rounded-lg border px-3 py-2"
          style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
        >
          <Search size={13} style={{ color: '#6b7280' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject or sender…"
            className="flex-1 bg-transparent text-sm text-white outline-none"
            style={{ color: '#e5e7eb' }}
          />
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#6b7280' }}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="accent-blue-500"
          />
          Unread only
        </label>
      </div>

      <div className="flex gap-1 mb-4 border-b" style={{ borderColor: '#1e2330' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-1.5 text-xs transition-colors"
            style={{
              color: activeTab === tab.id ? '#3B82F6' : '#6b7280',
              borderBottom: activeTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
              fontFamily: 'monospace',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 h-[calc(100vh-280px)]">
        {/* Email list */}
        <div
          className="w-80 shrink-0 rounded-lg border overflow-y-auto"
          style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
        >
          {loading ? (
            <div className="space-y-2 p-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded p-3 animate-pulse" style={{ backgroundColor: '#1e2330' }}>
                  <div className="h-3 rounded mb-2" style={{ backgroundColor: '#374151', width: '60%' }} />
                  <div className="h-2 rounded" style={{ backgroundColor: '#374151', width: '80%' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Mail size={24} style={{ color: '#374151' }} />
              <p className="text-xs" style={{ color: '#6b7280' }}>No messages found</p>
            </div>
          ) : (
            filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedId(msg.id)}
                className="w-full text-left p-3 border-b transition-colors hover:bg-white/5"
                style={{
                  borderColor: '#1e2330',
                  backgroundColor: selectedId === msg.id ? '#1e2330' : 'transparent',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: msg.isUnread ? '#fff' : '#9ca3af' }}
                  >
                    {msg.from.replace(/<.*>/, '').trim() || msg.from}
                  </p>
                  {msg.isUnread && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#3B82F6' }} />
                  )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: msg.isUnread ? '#e5e7eb' : '#6b7280' }}>
                  {msg.subject || '(no subject)'}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: '#4b5563' }}>
                  {msg.snippet}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Email detail */}
        <div
          className="flex-1 rounded-lg border p-5 overflow-y-auto"
          style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
        >
          {selected ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">{selected.subject || '(no subject)'}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-xs" style={{ color: '#6b7280' }}>From: {selected.from}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>{selected.date}</p>
                </div>
              </div>
              <div
                className="rounded-lg p-4 text-sm"
                style={{ backgroundColor: '#0f1117', color: '#9ca3af' }}
              >
                {selected.snippet}
              </div>
              <a
                href={`https://mail.google.com/mail/u/0/#inbox/${selected.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm"
                style={{ color: '#3B82F6' }}
              >
                <ExternalLink size={13} /> Open in Gmail
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Mail size={24} style={{ color: '#374151' }} />
              <p className="text-sm" style={{ color: '#6b7280' }}>Select an email to read</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

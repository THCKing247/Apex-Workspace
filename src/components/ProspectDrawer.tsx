'use client'

import { useState } from 'react'
import { X, Search, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react'

interface Contact {
  first_name: string
  last_name: string
  position: string | null
  email: string
  confidence: number
}

interface DomainResult {
  company: string
  domain: string
  pattern: string | null
  contacts: Contact[]
}

interface VerifyResult {
  email: string
  status: string
  score: number
  result: string
}

function confidenceBadge(score: number) {
  if (score >= 80) return { color: '#22c55e', bg: '#14532d33', label: `${score}%` }
  if (score >= 50) return { color: '#f59e0b', bg: '#78350f33', label: `${score}%` }
  return { color: '#ef4444', bg: '#7f1d1d33', label: `${score}%` }
}

interface Props {
  onClose: () => void
  onAddToPipeline: (data: { name: string; company: string; email: string }) => void
}

export default function ProspectDrawer({ onClose, onAddToPipeline }: Props) {
  const [tab, setTab] = useState<'domain' | 'verify'>('domain')
  const [domainInput, setDomainInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [domainResult, setDomainResult] = useState<DomainResult | null>(null)
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [noKey, setNoKey] = useState(false)

  async function searchDomain() {
    if (!domainInput.trim()) return
    setLoading(true)
    setError(null)
    setDomainResult(null)

    try {
      const res = await fetch(`/api/hunter?domain=${encodeURIComponent(domainInput.trim())}`)
      const data = await res.json()

      if (data.error === 'HUNTER_API_KEY not configured') {
        setNoKey(true)
        return
      }
      if (data.errors || !data.data) {
        setError(data.errors?.[0]?.details ?? 'No results found')
        return
      }

      const d = data.data
      setDomainResult({
        company: d.organization ?? domainInput,
        domain: d.domain,
        pattern: d.pattern ?? null,
        contacts: (d.emails ?? []).map((e: { first_name: string; last_name: string; position: string; value: string; confidence: number }) => ({
          first_name: e.first_name ?? '',
          last_name: e.last_name ?? '',
          position: e.position ?? null,
          email: e.value,
          confidence: e.confidence,
        })),
      })
    } catch {
      setError('Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function verifyEmail() {
    if (!emailInput.trim()) return
    setLoading(true)
    setError(null)
    setVerifyResult(null)

    try {
      const res = await fetch(`/api/hunter?action=verify&email=${encodeURIComponent(emailInput.trim())}`)
      const data = await res.json()

      if (data.error === 'HUNTER_API_KEY not configured') {
        setNoKey(true)
        return
      }

      setVerifyResult({
        email: data.data?.email ?? emailInput,
        status: data.data?.status ?? 'unknown',
        score: data.data?.score ?? 0,
        result: data.data?.result ?? 'unknown',
      })
    } catch {
      setError('Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative w-full max-w-lg h-full overflow-y-auto border-l flex flex-col"
        style={{ backgroundColor: '#13161f', borderColor: '#1e2330' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: '#1e2330' }}
        >
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>
            Prospect
          </h2>
          <button onClick={onClose} style={{ color: '#6b7280' }}><X size={16} /></button>
        </div>

        {noKey ? (
          <div className="p-5">
            <p className="text-sm" style={{ color: '#f59e0b' }}>
              Add <code className="bg-yellow-950/40 px-1 rounded">HUNTER_API_KEY</code> to{' '}
              <code className="bg-yellow-950/40 px-1 rounded">.env.local</code>
            </p>
            <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
              Free tier gives 25 searches/month — get your key at{' '}
              <a href="https://hunter.io" target="_blank" rel="noopener noreferrer" className="text-blue-400">
                hunter.io
              </a>
            </p>
          </div>
        ) : (
          <div className="flex-1 p-5 space-y-5">
            {/* Tabs */}
            <div className="flex gap-1 border-b" style={{ borderColor: '#1e2330' }}>
              {(['domain', 'verify'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-4 py-2 text-xs capitalize"
                  style={{
                    color: tab === t ? '#3B82F6' : '#6b7280',
                    borderBottom: tab === t ? '2px solid #3B82F6' : '2px solid transparent',
                    fontFamily: 'monospace',
                  }}
                >
                  {t === 'domain' ? 'Domain Search' : 'Email Verifier'}
                </button>
              ))}
            </div>

            {tab === 'domain' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchDomain()}
                    placeholder="Enter company domain (e.g. companydomain.com)"
                    className="flex-1 px-3 py-2 rounded border text-sm text-white outline-none focus:border-blue-500"
                    style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
                  />
                  <button
                    onClick={searchDomain}
                    disabled={loading}
                    className="px-3 py-2 rounded text-sm font-medium text-white disabled:opacity-60"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    <Search size={14} />
                  </button>
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                {loading && (
                  <div className="text-xs text-center py-8" style={{ color: '#6b7280' }}>
                    Searching…
                  </div>
                )}

                {domainResult && (
                  <div className="space-y-4">
                    <div
                      className="rounded-lg p-4 space-y-1"
                      style={{ backgroundColor: '#0f1117' }}
                    >
                      <p className="text-sm font-semibold text-white">{domainResult.company}</p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>{domainResult.domain}</p>
                      {domainResult.pattern && (
                        <p className="text-xs" style={{ color: '#9ca3af' }}>
                          Pattern: <code style={{ color: '#3B82F6' }}>{domainResult.pattern}@{domainResult.domain}</code>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium" style={{ color: '#6b7280' }}>
                        {domainResult.contacts.length} contact{domainResult.contacts.length !== 1 ? 's' : ''} found
                      </p>
                      {domainResult.contacts.map((contact, i) => {
                        const badge = confidenceBadge(contact.confidence)
                        const name = `${contact.first_name} ${contact.last_name}`.trim()
                        return (
                          <div
                            key={i}
                            className="rounded-lg border p-3 flex items-start justify-between gap-3"
                            style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium">{name || '—'}</p>
                              {contact.position && (
                                <p className="text-xs" style={{ color: '#6b7280' }}>{contact.position}</p>
                              )}
                              <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{contact.email}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className="text-xs px-1.5 py-0.5 rounded font-medium"
                                style={{ backgroundColor: badge.bg, color: badge.color }}
                              >
                                {badge.label}
                              </span>
                              <button
                                onClick={() => onAddToPipeline({
                                  name,
                                  company: domainResult.company,
                                  email: contact.email,
                                })}
                                className="p-1.5 rounded text-xs"
                                style={{ backgroundColor: '#1e2330', color: '#3B82F6' }}
                                title="Add to Pipeline"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        )
                      })}

                      {domainResult.contacts.length === 0 && (
                        <p className="text-xs py-4 text-center" style={{ color: '#6b7280' }}>
                          No contacts found for this domain
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'verify' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && verifyEmail()}
                    placeholder="Enter email address to verify"
                    className="flex-1 px-3 py-2 rounded border text-sm text-white outline-none focus:border-blue-500"
                    style={{ backgroundColor: '#0f1117', borderColor: '#1e2330' }}
                  />
                  <button
                    onClick={verifyEmail}
                    disabled={loading}
                    className="px-3 py-2 rounded text-sm font-medium text-white disabled:opacity-60"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    <Search size={14} />
                  </button>
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                {loading && (
                  <div className="text-xs text-center py-8" style={{ color: '#6b7280' }}>Verifying…</div>
                )}

                {verifyResult && (
                  <div
                    className="rounded-lg p-4 space-y-3"
                    style={{ backgroundColor: '#0f1117' }}
                  >
                    <p className="text-sm font-medium text-white">{verifyResult.email}</p>
                    <div className="flex items-center gap-3">
                      {verifyResult.status === 'valid' ? (
                        <CheckCircle size={16} style={{ color: '#22c55e' }} />
                      ) : verifyResult.status === 'invalid' ? (
                        <XCircle size={16} style={{ color: '#ef4444' }} />
                      ) : (
                        <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                      )}
                      <div>
                        <p className="text-sm text-white capitalize">{verifyResult.status}</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                          Deliverability: {verifyResult.result} · Score: {verifyResult.score}/100
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Trash2 } from 'lucide-react'
import { useAssistant } from '@/lib/assistant-context'

const BRAND_COLOR: Record<string, string> = {
  buildvance: '#00C97A',
  braik: '#FF7A33',
  apex: '#5B9BFF',
}

// Quick-action sets per page
const QUICK_ACTIONS: Record<string, { label: string; prompt: string }[]> = {
  Pipeline: [
    { label: 'Summarize pipeline activity', prompt: 'Summarize today\'s pipeline activity and suggest the highest-priority follow-up.' },
    { label: 'Draft follow-up', prompt: 'Draft a short follow-up message for the lead I\'m currently viewing.' },
  ],
  Projects: [
    { label: 'Draft client update', prompt: 'Draft a short client status update for the project I\'m currently viewing.' },
    { label: 'Scope next milestone', prompt: 'Help me scope the next milestone for this project.' },
  ],
  Dashboard: [
    { label: 'What should I focus on today?', prompt: 'Based on my current pipeline and recent activity, what should I focus on today?' },
    { label: 'Weekly priorities', prompt: 'Give me the top 3 things I should prioritize this week as a 2-person shop.' },
  ],
}

const DEFAULT_ACTIONS = [
  { label: 'What should I prioritize?', prompt: 'What should I prioritize this week as a 2-person shop running Buildvance and Braik?' },
  { label: 'Draft a LinkedIn post', prompt: 'Write 2 LinkedIn posts — one for Buildvance and one for Braik — for this week.' },
]

export default function AssistantPanel() {
  const { messages, addMessage, clearConversation, pageContext, actionLog, isOpen, setIsOpen } = useAssistant()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom when messages change or panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [messages, isOpen])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  const quickActions = QUICK_ACTIONS[pageContext.pageLabel] ?? DEFAULT_ACTIONS

  const panelColor = pageContext.recordType
    ? (BRAND_COLOR[actionLog.findLast((a) => a.brand)?.brand ?? 'apex'] ?? '#5B9BFF')
    : '#5B9BFF'

  async function sendMessage(text: string) {
    const userMsg = text.trim()
    if (!userMsg || loading) return
    setInput('')
    addMessage({ role: 'user', content: userMsg })
    setLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
          brandContext: 'general',
          appContext: {
            pageContext,
            recentActions: actionLog.slice(-10),
          },
        }),
      })

      if (!res.ok || !res.body) {
        addMessage({ role: 'assistant', content: 'Something went wrong. Please try again.' })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            // Anthropic SSE: content_block_delta with delta.text
            const delta =
              parsed.delta?.text ??
              parsed.delta?.partial_json ??
              parsed.choices?.[0]?.delta?.content ??
              ''
            fullText += delta
          } catch { /* partial chunk */ }
        }
      }

      addMessage({ role: 'assistant', content: fullText || '(No response received)' })
    } catch {
      addMessage({ role: 'assistant', content: 'Connection error. Check your ANTHROPIC_API_KEY.' })
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const displayMessages = messages.filter((m) => m.content !== '' || m.role === 'user')

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: 380,
        zIndex: 49,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--shell-bg)',
        borderLeft: '1px solid var(--shell-border)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--shell-border)' }}
      >
        <div className="flex-1 min-w-0">
          <p
            className="font-display uppercase tracking-widest"
            style={{ color: 'var(--apex)', fontSize: 13, letterSpacing: '0.08em' }}
          >
            AI ASSISTANT
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--shell-ink-dim)', fontFamily: 'var(--font-sans)', marginTop: 1 }}>
            {pageContext.pageLabel}
            {pageContext.recordSummary ? ` · ${pageContext.recordSummary}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              title="Clear conversation"
              style={{ color: 'var(--shell-ink-muted)', padding: 4 }}
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            style={{ color: 'var(--shell-ink-muted)', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Quick actions */}
      {messages.length === 0 && (
        <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--shell-border)' }}>
          <p className="font-display uppercase tracking-widest mb-2" style={{ color: 'var(--shell-ink-muted)', fontSize: 9, letterSpacing: '0.1em' }}>
            Quick actions
          </p>
          <div className="flex flex-col gap-1.5">
            {quickActions.map(({ label, prompt }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                className="text-left px-3 py-2 rounded-md text-xs transition-colors"
                style={{
                  backgroundColor: 'rgba(91,155,255,0.08)',
                  border: '1px solid rgba(91,155,255,0.2)',
                  color: 'var(--shell-ink-dim)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 0 }}>
        {displayMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' ? (
              <div
                className="max-w-[90%] px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: 'rgba(16,32,74,0.6)',
                  borderLeft: `3px solid ${panelColor}`,
                  color: 'var(--shell-ink)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div
                className="max-w-[85%] px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: 'rgba(91,155,255,0.15)',
                  border: '1px solid rgba(91,155,255,0.25)',
                  color: 'var(--shell-ink)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {/* Thinking indicator */}
        {loading && (
          <div className="flex justify-start">
            <div
              className="px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: 'rgba(16,32,74,0.6)',
                borderLeft: `3px solid ${panelColor}`,
                color: 'var(--shell-ink-muted)',
                fontStyle: 'italic',
                fontSize: 13,
              }}
            >
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 px-4 py-3 border-t"
        style={{ borderColor: 'var(--shell-border)' }}
      >
        <div
          className="flex items-end gap-2 rounded-lg px-3 py-2"
          style={{ backgroundColor: 'rgba(16,32,74,0.6)', border: '1px solid rgba(91,155,255,0.2)' }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your work…"
            disabled={loading}
            className="flex-1 resize-none bg-transparent outline-none text-sm"
            style={{
              color: 'var(--shell-ink)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              maxHeight: 120,
              overflowY: 'auto',
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              color: input.trim() ? '#5B9BFF' : 'var(--shell-ink-muted)',
              flexShrink: 0,
              padding: 2,
              transition: 'color 0.15s',
            }}
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--shell-ink-muted)', fontFamily: 'var(--font-sans)', fontSize: 10 }}>
          Enter to send · Shift+Enter for new line · Clears on tab close
        </p>
      </div>
    </div>
  )
}

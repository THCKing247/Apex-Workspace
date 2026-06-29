'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Copy, Check } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  'Draft a cold outreach email to a high school AD about Braik',
  'Write a Buildvance proposal intro for a plumbing company',
  'Give me 3 LinkedIn post ideas for Apex TSG this week',
  'What should I prioritize this week as a 2-person dev shop?',
]

function CodeBlock({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')
          return (
            <pre
              key={i}
              className="rounded p-3 text-xs overflow-x-auto my-2"
              style={{ backgroundColor: '#0f1117', fontFamily: 'monospace', color: '#e5e7eb' }}
            >
              {code}
            </pre>
          )
        }
        return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
      })}
    </>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#6b7280' }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  )
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const content = text ?? input.trim()
    if (!content || loading) return

    const userMessage: Message = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const assistantPlaceholder: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantPlaceholder])

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: 'Error: could not reach the API. Check ANTHROPIC_API_KEY.' },
        ])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json.delta?.text ?? ''
            if (delta) {
              setMessages((prev) => {
                const last = prev[prev.length - 1]
                return [...prev.slice(0, -1), { ...last, content: last.content + delta }]
              })
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Connection error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center gap-2 mb-4">
        <Bot size={18} style={{ color: '#3B82F6' }} />
        <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'monospace' }}>
          AI Assistant
        </h1>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1e2330', color: '#6b7280' }}>
          Claude
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-16">
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Ask anything about Apex TSG, your clients, or your business.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => send(action)}
                  className="text-left text-xs px-3 py-2.5 rounded-lg border transition-colors hover:border-blue-500/50"
                  style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330', color: '#9ca3af' }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div
                className="max-w-xl rounded-lg px-4 py-2.5 text-sm text-white"
                style={{ backgroundColor: '#3B82F6' }}
              >
                {msg.content}
              </div>
            ) : (
              <div
                className="group max-w-2xl rounded-lg border px-4 py-3 text-sm text-white relative"
                style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
              >
                <div className="absolute top-2 right-2">
                  <CopyButton text={msg.content} />
                </div>
                {msg.content ? (
                  <CodeBlock content={msg.content} />
                ) : (
                  <span className="animate-pulse" style={{ color: '#6b7280' }}>▌</span>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions when there are messages */}
      {messages.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => send(action)}
              className="shrink-0 text-xs px-2.5 py-1.5 rounded border whitespace-nowrap"
              style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330', color: '#9ca3af' }}
            >
              {action.slice(0, 40)}…
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="flex items-end gap-2 rounded-lg border p-3"
        style={{ backgroundColor: '#1a1d2e', borderColor: '#1e2330' }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="flex-1 bg-transparent text-sm text-white outline-none resize-none placeholder:text-gray-600"
          style={{ fontFamily: 'inherit' }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="p-2 rounded-lg disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: '#3B82F6' }}
        >
          <Send size={14} className="text-white" />
        </button>
      </div>
    </div>
  )
}

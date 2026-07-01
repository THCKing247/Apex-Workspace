'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssistantMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export type ActionLogEntry = {
  id: string
  description: string   // e.g. "Moved lead 'Acme Plumbing' to Proposal"
  page: string          // route path, e.g. '/pipeline'
  brand: 'buildvance' | 'braik' | 'apex' | null
  timestamp: number
}

export type PageContext = {
  route: string
  pageLabel: string
  recordType: string | null      // e.g. "lead", "project", "braik_target", "note"
  recordId: string | null
  recordSummary: string | null   // e.g. "Acme Plumbing — Proposal stage, Buildvance"
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const STORAGE_MESSAGES   = 'apex_assistant_messages'
const STORAGE_ACTION_LOG = 'apex_assistant_actionlog'
const MAX_ACTIONS = 10

// ─── Context value shape ──────────────────────────────────────────────────────

interface AssistantContextValue {
  messages: AssistantMessage[]
  addMessage: (msg: Omit<AssistantMessage, 'timestamp'>) => void
  clearConversation: () => void

  actionLog: ActionLogEntry[]
  logAction: (entry: Omit<ActionLogEntry, 'id' | 'timestamp'>) => void

  pageContext: PageContext
  setPageContext: (ctx: PageContext) => void

  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AssistantContext = createContext<AssistantContextValue | null>(null)

// ─── Debounced sessionStorage writer ─────────────────────────────────────────

function useDebounceWrite() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  return useCallback((key: string, value: unknown) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value))
      } catch {
        // sessionStorage unavailable (SSR guard or private mode)
      }
    }, 200)
  }, [])
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_CONTEXT: PageContext = {
  route: '/',
  pageLabel: 'Workspace',
  recordType: null,
  recordId: null,
  recordSummary: null,
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const write = useDebounceWrite()

  const [messages, setMessages] = useState<AssistantMessage[]>(() =>
    readStorage<AssistantMessage[]>(STORAGE_MESSAGES, [])
  )
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>(() =>
    readStorage<ActionLogEntry[]>(STORAGE_ACTION_LOG, [])
  )
  const [pageContext, setPageContextState] = useState<PageContext>(DEFAULT_PAGE_CONTEXT)
  const [isOpen, setIsOpen] = useState(false)

  // Sync messages to sessionStorage
  useEffect(() => {
    write(STORAGE_MESSAGES, messages)
  }, [messages, write])

  // Sync actionLog to sessionStorage
  useEffect(() => {
    write(STORAGE_ACTION_LOG, actionLog)
  }, [actionLog, write])

  const addMessage = useCallback((msg: Omit<AssistantMessage, 'timestamp'>) => {
    setMessages((prev) => [...prev, { ...msg, timestamp: Date.now() }])
  }, [])

  const clearConversation = useCallback(() => {
    setMessages([])
    try { sessionStorage.removeItem(STORAGE_MESSAGES) } catch { /* noop */ }
  }, [])

  const logAction = useCallback((entry: Omit<ActionLogEntry, 'id' | 'timestamp'>) => {
    setActionLog((prev) => {
      const next = [
        ...prev,
        { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
      ]
      // Keep only the last MAX_ACTIONS entries
      return next.slice(-MAX_ACTIONS)
    })
  }, [])

  const setPageContext = useCallback((ctx: PageContext) => {
    setPageContextState(ctx)
  }, [])

  return (
    <AssistantContext.Provider
      value={{
        messages, addMessage, clearConversation,
        actionLog, logAction,
        pageContext, setPageContext,
        isOpen, setIsOpen,
      }}
    >
      {children}
    </AssistantContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAssistant(): AssistantContextValue {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant must be used inside <AssistantProvider>')
  return ctx
}

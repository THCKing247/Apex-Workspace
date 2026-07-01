'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// ─── App-wide brand scope ───────────────────────────────────────────────────
// Single source of truth for "which company's lens am I viewing through."
// Apex = everything combined. Buildvance and Braik = that business only.
// Persisted to localStorage so it survives reloads — personal viewing preference.

export type BrandScope = 'all' | 'buildvance' | 'braik'

interface BrandScopeContextValue {
  scope:    BrandScope
  setScope: (scope: BrandScope) => void
}

const BrandScopeContext = createContext<BrandScopeContextValue | null>(null)

const STORAGE_KEY = 'apex_brand_scope'

export function BrandScopeProvider({ children }: { children: ReactNode }) {
  const [scope, setScopeState] = useState<BrandScope>('all')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as BrandScope | null
    if (saved && ['all', 'buildvance', 'braik'].includes(saved)) setScopeState(saved)
    setHydrated(true)
  }, [])

  function setScope(next: BrandScope) {
    setScopeState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  if (!hydrated) return null

  return (
    <BrandScopeContext.Provider value={{ scope, setScope }}>
      {children}
    </BrandScopeContext.Provider>
  )
}

export function useBrandScope() {
  const ctx = useContext(BrandScopeContext)
  if (!ctx) throw new Error('useBrandScope must be used within BrandScopeProvider')
  return ctx
}

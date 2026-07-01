'use client'

import { useMemo } from 'react'
import { useBrandScope, type BrandScope } from '@/lib/brand-scope-context'

// ─── Shared scoping hook for list pages ────────────────────────────────────
// Drop this into Pipeline, Projects, Braik Targets, Notes, Resources,
// Competitors — anywhere a list of brand-tagged records is rendered.
// Filters client-side against the same global scope context the
// sidebar/top-bar/dashboard all read — switching brands anywhere
// in the app instantly re-filters every scoped list at once.
//
// Usage:
//   const { filtered, hiddenCount } = useScopedFilter(leads)
//   // items must each have a `.brand` field: 'buildvance' | 'braik' | 'apex'
//
// Braik targets have no `brand` column (everything IS Braik), so pass
// braikOnly: true and the hook will show/hide the whole list based on scope.

export function useScopedFilter<T extends { brand?: string | null }>(
  items: T[],
  options?: { braikOnly?: boolean; buildvanceOnly?: boolean }
) {
  const { scope, setScope } = useBrandScope()

  const filtered = useMemo(() => {
    if (options?.braikOnly)      return scope === 'buildvance' ? [] : items
    if (options?.buildvanceOnly) return scope === 'braik'      ? [] : items
    if (scope === 'all') return items
    return items.filter(item => item.brand === scope)
  }, [items, scope, options?.braikOnly, options?.buildvanceOnly])

  return {
    scope,
    setScope,
    filtered,
    isFiltered:  scope !== 'all',
    hiddenCount: items.length - filtered.length,
  }
}

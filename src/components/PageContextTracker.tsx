'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAssistant } from '@/lib/assistant-context'

const PAGE_LABELS: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/pipeline':      'Pipeline',
  '/projects':      'Projects',
  '/braik-targets': 'Braik Targets',
  '/calendar':      'Calendar',
  '/inbox':         'Inbox',
  '/social':        'Social',
  '/notes':         'Notes',
  '/resources':     'Resources',
  '/competitors':   'Competitors',
  '/action-needed': 'Action Needed',
  '/assistant':     'AI Assistant',
  '/settings':      'Settings',
}

function getPageLabel(pathname: string): string {
  // Try exact match first, then prefix match
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
  const match = Object.keys(PAGE_LABELS).find((k) => pathname.startsWith(k + '/'))
  return match ? PAGE_LABELS[match] : 'Workspace'
}

export default function PageContextTracker() {
  const pathname = usePathname()
  const { setPageContext } = useAssistant()

  useEffect(() => {
    setPageContext({
      route: pathname,
      pageLabel: getPageLabel(pathname),
      // Clear record-level context on navigation — individual pages re-set these
      recordType: null,
      recordId: null,
      recordSummary: null,
    })
  }, [pathname, setPageContext])

  return null
}

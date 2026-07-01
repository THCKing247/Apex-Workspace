'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useAssistant } from '@/lib/assistant-context'

// Lazy-load the heavy chat panel — code is never fetched until first open
const AssistantPanel = dynamic(() => import('./AssistantPanel'), { ssr: false })

export default function AssistantPanelLoader() {
  const { isOpen } = useAssistant()
  // Once opened, keep the panel mounted (just hide/show via CSS transform) so
  // toggling is instant and message history is never lost on re-mount.
  const [hasOpened, setHasOpened] = useState(false)

  useEffect(() => {
    if (isOpen) setHasOpened(true)
  }, [isOpen])

  if (!hasOpened) return null
  return <AssistantPanel />
}

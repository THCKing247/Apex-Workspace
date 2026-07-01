'use client'

import { useAssistant } from '@/lib/assistant-context'

const PANEL_WIDTH = 380

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { isOpen } = useAssistant()

  return (
    <div
      className="flex-1 min-w-0 flex flex-col"
      style={{
        marginLeft: 224,
        marginRight: isOpen ? PANEL_WIDTH : 0,
        transition: 'margin-right 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {children}
    </div>
  )
}

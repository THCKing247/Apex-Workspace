'use client'

import { Bot } from 'lucide-react'
import { useAssistant } from '@/lib/assistant-context'

export default function AssistantTrigger() {
  const { isOpen, setIsOpen } = useAssistant()

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      aria-label="Toggle AI assistant"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'linear-gradient(180deg,#16265a 0%,#10204a 100%)',
        border: '1px solid rgba(91,155,255,0.35)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(91,155,255,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
        e.currentTarget.style.transform = 'scale(1.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <Bot size={22} color="#5B9BFF" />
    </button>
  )
}

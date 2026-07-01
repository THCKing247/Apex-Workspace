'use client'

import { useState } from 'react'
import Image from 'next/image'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type AccentColor = 'apex' | 'buildvance' | 'braik'

interface NavItem {
  nav_key:      string
  label:        string
  sort_order:   number
  visible:      boolean
  accent_color: AccentColor
}

const ACCENT_COLOR: Record<AccentColor, string> = {
  apex:       '#5B9BFF',
  buildvance: '#00C97A',
  braik:      '#FF7A33',
}

const BRAND_LOGO: Record<AccentColor, { src: string; alt: string }> = {
  apex:       { src: '/logos/apex-logo.png',       alt: 'Apex TSG'   },
  buildvance: { src: '/logos/buildvance-logo.png', alt: 'Buildvance' },
  braik:      { src: '/logos/braik-logo.png',      alt: 'Braik'      },
}

const NON_HIDEABLE = ['dashboard', 'settings']

// Maps each nav_key to its sidebar section
const SECTION_MAP: Record<string, string> = {
  'dashboard':     'TODAY',
  'action-needed': 'TODAY',
  'reports':       'TODAY',
  'pipeline':      'TODAY',
  'calendar':      'TODAY',
  'inbox':         'TODAY',
  'projects':      'WORK',
  'braik-targets': 'WORK',
  'notes':         'WORK',
  'social':        'GROWTH',
  'competitors':   'GROWTH',
  'resources':     'GROWTH',
  'assistant':     'SYSTEM',
  'settings':      'SYSTEM',
}

const SECTION_ORDER = ['TODAY', 'WORK', 'GROWTH', 'SYSTEM'] as const
type Section = typeof SECTION_ORDER[number]

const SECTION_COLOR: Record<Section, string> = {
  TODAY:  'var(--apex)',
  WORK:   'var(--buildvance)',
  GROWTH: 'var(--braik)',
  SYSTEM: 'var(--ink-muted)',
}

interface Props {
  initialItems: NavItem[]
}

export default function SidebarCustomizer({ initialItems }: Props) {
  const [items, setItems] = useState<NavItem[]>(initialItems)
  const supabase = createClient()

  function getSection(nav_key: string): Section {
    return (SECTION_MAP[nav_key] as Section) ?? 'SYSTEM'
  }

  function getSectionItems(section: Section): NavItem[] {
    return items
      .filter(i => getSection(i.nav_key) === section)
      .sort((a, b) => a.sort_order - b.sort_order)
  }

  async function persistSortOrders(updated: NavItem[]) {
    await Promise.all(
      updated.map(item =>
        supabase
          .from('sidebar_config')
          .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
          .eq('nav_key', item.nav_key)
      )
    )
    toast.success('Sidebar updated')
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const { source, destination } = result

    // Cross-section drops are not supported
    if (source.droppableId !== destination.droppableId) return
    if (source.index === destination.index) return

    const section = source.droppableId as Section
    const sectionItems = getSectionItems(section)

    const reordered = Array.from(sectionItems)
    const [moved] = reordered.splice(source.index, 1)
    reordered.splice(destination.index, 0, moved)

    // Rebuild the full items list preserving inter-section order
    const allReordered = SECTION_ORDER.flatMap(sec =>
      sec === section ? reordered : getSectionItems(sec)
    )
    const updated = allReordered.map((item, i) => ({ ...item, sort_order: i + 1 }))
    setItems(updated)
    await persistSortOrders(updated)
  }

  async function toggleVisible(nav_key: string) {
    const item = items.find(i => i.nav_key === nav_key)
    if (!item) return
    const newVisible = !item.visible
    setItems(prev => prev.map(i => i.nav_key === nav_key ? { ...i, visible: newVisible } : i))
    const { error } = await supabase
      .from('sidebar_config')
      .update({ visible: newVisible, updated_at: new Date().toISOString() })
      .eq('nav_key', nav_key)
    if (error) toast.error('Failed to update sidebar')
    else toast.success('Sidebar updated')
  }

  async function setAccent(nav_key: string, accent_color: AccentColor) {
    setItems(prev => prev.map(i => i.nav_key === nav_key ? { ...i, accent_color } : i))
    const { error } = await supabase
      .from('sidebar_config')
      .update({ accent_color, updated_at: new Date().toISOString() })
      .eq('nav_key', nav_key)
    if (error) toast.error('Failed to update sidebar')
    else toast.success('Sidebar updated')
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {SECTION_ORDER.map(section => {
          const sectionItems = getSectionItems(section)
          if (sectionItems.length === 0) return null

          const color = SECTION_COLOR[section]

          return (
            <div key={section}>
              {/* Section header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 8, paddingBottom: 6,
                borderBottom: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: color, display: 'inline-block', flexShrink: 0,
                }} />
                <span className="font-display" style={{
                  fontSize: 10, letterSpacing: '0.12em', color,
                }}>
                  {section}
                </span>
              </div>

              <Droppable droppableId={section}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    {sectionItems.map((item, index) => {
                      const nonHideable = NON_HIDEABLE.includes(item.nav_key)

                      return (
                        <Draggable key={item.nav_key} draggableId={item.nav_key} index={index}>
                          {(drag, snapshot) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 12px', borderRadius: 8,
                                background: snapshot.isDragging
                                  ? 'var(--card-bg)'
                                  : item.visible
                                  ? 'var(--card-bg)'
                                  : 'var(--body-bg)',
                                border: `1px solid ${snapshot.isDragging ? `color-mix(in srgb, ${color} 40%, var(--card-border))` : 'var(--card-border)'}`,
                                boxShadow: snapshot.isDragging ? 'var(--card-shadow)' : undefined,
                                opacity: item.visible ? 1 : 0.5,
                                ...drag.draggableProps.style,
                              }}
                            >
                              {/* Drag handle */}
                              <div
                                {...drag.dragHandleProps}
                                style={{ color: 'var(--ink-disabled)', cursor: 'grab', flexShrink: 0 }}
                              >
                                <GripVertical size={13} />
                              </div>

                              {/* Label */}
                              <span
                                className="font-display uppercase flex-1"
                                style={{
                                  fontSize: 13, letterSpacing: '0.04em',
                                  color: item.visible ? 'var(--ink-primary)' : 'var(--ink-muted)',
                                }}
                              >
                                {item.label}
                              </span>

                              {/* Brand logo swatches */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {(['apex', 'buildvance', 'braik'] as AccentColor[]).map((ac) => {
                                  const logo = BRAND_LOGO[ac]
                                  const active = item.accent_color === ac
                                  return (
                                    <button
                                      key={ac}
                                      onClick={() => setAccent(item.nav_key, ac)}
                                      title={logo.alt}
                                      style={{
                                        padding: 2,
                                        outline: active ? `2px solid ${ACCENT_COLOR[ac]}` : '2px solid transparent',
                                        outlineOffset: 1,
                                        opacity: active ? 1 : 0.3,
                                        borderRadius: 4,
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Image
                                        src={logo.src}
                                        alt={logo.alt}
                                        width={28}
                                        height={18}
                                        style={{ objectFit: 'contain', display: 'block' }}
                                      />
                                    </button>
                                  )
                                })}
                              </div>

                              {/* Visibility toggle */}
                              <div className="relative group" style={{ flexShrink: 0 }}>
                                <button
                                  onClick={() => !nonHideable && toggleVisible(item.nav_key)}
                                  disabled={nonHideable}
                                  style={{
                                    color: item.visible ? 'var(--apex)' : 'var(--ink-disabled)',
                                    cursor: nonHideable ? 'not-allowed' : 'pointer',
                                    opacity: nonHideable ? 0.35 : 1,
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                {nonHideable && (
                                  <span
                                    className="absolute right-0 top-6 hidden group-hover:block whitespace-nowrap z-10"
                                    style={{
                                      background: 'var(--shell-bg)',
                                      border: '1px solid var(--apex-border)',
                                      color: 'var(--shell-ink-dim)',
                                      fontFamily: 'var(--font-inter)',
                                      fontSize: 11,
                                      padding: '3px 8px',
                                      borderRadius: 6,
                                    }}
                                  >
                                    Can&apos;t hide this
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

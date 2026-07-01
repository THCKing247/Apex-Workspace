'use client'

import { useState } from 'react'
import Image from 'next/image'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type AccentColor = 'apex' | 'buildvance' | 'braik'

interface NavItem {
  nav_key: string
  label: string
  sort_order: number
  visible: boolean
  accent_color: AccentColor
}

const ACCENT_COLOR: Record<AccentColor, string> = {
  apex: '#5B9BFF',
  buildvance: '#00E08A',
  braik: '#FF7A33',
}

const BRAND_LOGO: Record<AccentColor, { src: string; alt: string }> = {
  apex:       { src: '/logos/apex-logo.png',       alt: 'Apex TSG' },
  buildvance: { src: '/logos/buildvance-logo.png', alt: 'Buildvance' },
  braik:      { src: '/logos/braik-logo.png',      alt: 'Braik' },
}

const NON_HIDEABLE = ['dashboard', 'settings']

interface Props {
  initialItems: NavItem[]
}

export default function SidebarCustomizer({ initialItems }: Props) {
  const [items, setItems] = useState<NavItem[]>(initialItems)
  const supabase = createClient()

  async function updateRow(nav_key: string, patch: Partial<NavItem>) {
    const { error } = await supabase
      .from('sidebar_config')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('nav_key', nav_key)
    if (error) {
      toast.error('Failed to update sidebar')
    } else {
      toast.success('Sidebar updated')
    }
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const reordered = Array.from(items)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    const updated = reordered.map((item, i) => ({ ...item, sort_order: i + 1 }))
    setItems(updated)

    // Batch update all sort_orders
    await Promise.all(
      updated.map((item) =>
        supabase
          .from('sidebar_config')
          .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
          .eq('nav_key', item.nav_key)
      )
    )
    toast.success('Sidebar updated')
  }

  async function toggleVisible(nav_key: string) {
    const item = items.find((i) => i.nav_key === nav_key)
    if (!item) return
    const newVisible = !item.visible
    setItems((prev) =>
      prev.map((i) => (i.nav_key === nav_key ? { ...i, visible: newVisible } : i))
    )
    await updateRow(nav_key, { visible: newVisible })
  }

  async function setAccent(nav_key: string, accent_color: AccentColor) {
    setItems((prev) =>
      prev.map((i) => (i.nav_key === nav_key ? { ...i, accent_color } : i))
    )
    await updateRow(nav_key, { accent_color })
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="sidebar-nav">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-1"
          >
            {items.map((item, index) => {
              const nonHideable = NON_HIDEABLE.includes(item.nav_key)
              return (
                <Draggable key={item.nav_key} draggableId={item.nav_key} index={index}>
                  {(drag, snapshot) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                      style={{
                        background: snapshot.isDragging
                          ? 'linear-gradient(135deg,rgba(91,155,255,0.28) 0%,rgba(30,90,220,0.22) 100%)'
                          : item.visible
                          ? 'linear-gradient(135deg,rgba(91,155,255,0.18) 0%,rgba(20,70,200,0.12) 100%)'
                          : 'rgba(91,155,255,0.05)',
                        border: `1px solid ${snapshot.isDragging ? 'rgba(91,155,255,0.7)' : 'rgba(91,155,255,0.38)'}`,
                        boxShadow: item.visible && !snapshot.isDragging
                          ? '0 0 0 0.5px rgba(91,155,255,0.12) inset'
                          : undefined,
                        opacity: item.visible ? 1 : 0.5,
                      }}
                    >
                      {/* Drag handle */}
                      <div {...drag.dragHandleProps} style={{ color: '#3d4f87', cursor: 'grab' }}>
                        <GripVertical size={14} />
                      </div>

                      {/* Label */}
                      <span
                        className="flex-1 uppercase tracking-widest"
                        style={{ fontFamily: 'var(--font-teko)', fontSize: 14, color: item.visible ? '#f4f8ff' : '#5f73a3' }}
                      >
                        {item.label}
                      </span>

                      {/* Brand logo swatches */}
                      <div className="flex items-center gap-2">
                        {(['apex', 'buildvance', 'braik'] as AccentColor[]).map((ac) => {
                          const logo = BRAND_LOGO[ac]
                          const active = item.accent_color === ac
                          return (
                            <button
                              key={ac}
                              onClick={() => setAccent(item.nav_key, ac)}
                              title={logo.alt}
                              className="transition-all duration-150 hover:scale-110"
                              style={{
                                padding: 2,
                                outline: active ? `2px solid ${ACCENT_COLOR[ac]}` : '2px solid transparent',
                                outlineOffset: 1,
                                opacity: active ? 1 : 0.4,
                                borderRadius: 4,
                              }}
                            >
                              <Image
                                src={logo.src}
                                alt={logo.alt}
                                width={32}
                                height={20}
                                style={{ objectFit: 'contain', display: 'block' }}
                              />
                            </button>
                          )
                        })}
                      </div>

                      {/* Visibility toggle */}
                      <div className="relative group">
                        <button
                          onClick={() => !nonHideable && toggleVisible(item.nav_key)}
                          disabled={nonHideable}
                          style={{
                            color: item.visible ? '#7d9cd9' : '#3d4f87',
                            cursor: nonHideable ? 'not-allowed' : 'pointer',
                            opacity: nonHideable ? 0.4 : 1,
                          }}
                        >
                          {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        {nonHideable && (
                          <span
                            className="absolute right-0 top-6 hidden group-hover:block text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                            style={{
                              backgroundColor: '#10204a',
                              border: '1px solid rgba(91,155,255,0.3)',
                              color: '#7d9cd9',
                              fontFamily: 'var(--font-inter)',
                              fontSize: 11,
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
    </DragDropContext>
  )
}

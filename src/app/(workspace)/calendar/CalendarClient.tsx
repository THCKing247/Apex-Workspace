'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

const BRAND_COLOR: Record<string, string> = {
  buildvance: '#00E08A',
  braik: '#FF7A33',
  apex: '#5B9BFF',
}

type BrandType = 'buildvance' | 'braik' | 'apex'

interface CalEvent {
  id: string
  title: string
  start_time: string
  end_time: string | null
  brand: BrandType | null
  google_event_id: string | null
}

interface Project {
  id: string
  name: string
}

interface Lead {
  id: string
  name: string
}

interface Props {
  initialEvents: CalEvent[]
  projects: Project[]
  leads: Lead[]
  googleConfigured: boolean
}

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default function CalendarClient({ initialEvents, projects, leads, googleConfigured }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [events, setEvents] = useState<CalEvent[]>(initialEvents)
  const [popover, setPopover] = useState<CalEvent | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    brand: '' as BrandType | '',
    project_id: '',
    lead_id: '',
  })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  function eventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter((e) => e.start_time.startsWith(dateStr))
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  async function handleAddEvent() {
    if (!form.title.trim() || !form.start) return
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        start: form.start,
        end: form.end || form.start,
        brand: form.brand || null,
        project_id: form.project_id || null,
        lead_id: form.lead_id || null,
      }),
    })
    if (!res.ok) { toast.error('Failed to create event'); return }
    const newEvent = await res.json()
    setEvents((prev) => [...prev, newEvent])
    toast.success('Event created')
    setShowAdd(false)
    setForm({ title: '', description: '', start: '', end: '', brand: '', project_id: '', lead_id: '' })
  }

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      {!googleConfigured && (
        <div
          className="rounded-lg border px-4 py-3 text-xs"
          style={{ borderColor: '#1a2842', backgroundColor: '#0d1420', color: '#8b95ab', fontFamily: 'monospace' }}
        >
          Google Calendar not connected — events you create here are saved locally only.{' '}
          <span style={{ color: '#5B9BFF' }}>
            Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN to .env.local to enable sync.
          </span>
        </div>
      )}

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1 rounded" style={{ color: '#5d6b85' }}>
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>
            {monthName}
          </h2>
          <button onClick={nextMonth} className="p-1 rounded" style={{ color: '#5d6b85' }}>
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
          style={{ backgroundColor: '#5B9BFF', color: '#070a12', fontFamily: 'monospace' }}
        >
          <Plus size={12} /> New Event
        </button>
      </div>

      {/* Grid */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: '#1a2842' }}>
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs uppercase tracking-widest"
              style={{ color: '#5d6b85', fontFamily: 'monospace', fontSize: 9 }}
            >
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dayEvents = day ? eventsForDay(day) : []
            const isToday =
              day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
            return (
              <div
                key={i}
                className="border-b border-r min-h-16 p-1.5"
                style={{ borderColor: '#0f1626' }}
              >
                {day && (
                  <>
                    <span
                      className="text-xs font-medium"
                      style={{
                        fontFamily: 'monospace',
                        color: isToday ? '#5B9BFF' : '#5d6b85',
                        backgroundColor: isToday ? 'rgba(91,155,255,0.12)' : 'transparent',
                        borderRadius: 4,
                        padding: '1px 4px',
                      }}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => setPopover(ev)}
                          className="w-full text-left text-xs px-1.5 py-0.5 rounded truncate"
                          style={{
                            backgroundColor: `${BRAND_COLOR[ev.brand ?? 'apex'] ?? '#5B9BFF'}22`,
                            color: BRAND_COLOR[ev.brand ?? 'apex'] ?? '#5B9BFF',
                            fontFamily: 'monospace',
                            fontSize: 9,
                          }}
                        >
                          {ev.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-xs pl-1" style={{ color: '#5d6b85', fontFamily: 'monospace', fontSize: 9 }}>
                          +{dayEvents.length - 3} more
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Event popover */}
      {popover && (
        <div
          className="fixed bottom-6 right-6 w-72 rounded-lg border p-4 z-50 shadow-xl space-y-2"
          style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>
                {popover.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>
                {new Date(popover.start_time).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </p>
            </div>
            <button onClick={() => setPopover(null)} style={{ color: '#5d6b85' }}>
              <X size={14} />
            </button>
          </div>
          {popover.brand && (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${BRAND_COLOR[popover.brand]}18`,
                color: BRAND_COLOR[popover.brand],
                fontFamily: 'monospace',
                fontSize: 9,
              }}
            >
              {popover.brand}
            </span>
          )}
        </div>
      )}

      {/* Add event modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div
            className="rounded-lg border p-6 w-full max-w-md space-y-4"
            style={{ backgroundColor: '#0d1420', borderColor: '#1a2842' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'monospace' }}>New Event</h2>
              <button onClick={() => setShowAdd(false)} style={{ color: '#5d6b85' }}><X size={16} /></button>
            </div>
            {[
              { key: 'title', label: 'Title *', type: 'text', placeholder: 'Client call' },
              { key: 'description', label: 'Description', type: 'text', placeholder: 'Optional' },
              { key: 'start', label: 'Start *', type: 'datetime-local', placeholder: '' },
              { key: 'end', label: 'End', type: 'datetime-local', placeholder: '' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>{label}</label>
                <input
                  type={type}
                  className="w-full rounded border px-3 py-1.5 text-xs bg-transparent"
                  style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace' }}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Brand</label>
              <select
                className="w-full rounded border px-3 py-1.5 text-xs"
                style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace', backgroundColor: '#0d1420' }}
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value as BrandType | '' }))}
              >
                <option value="">None</option>
                <option value="buildvance">Buildvance</option>
                <option value="braik">Braik</option>
                <option value="apex">Apex</option>
              </select>
            </div>
            {projects.length > 0 && (
              <div>
                <label className="block text-xs mb-1" style={{ color: '#5d6b85', fontFamily: 'monospace' }}>Link to Project</label>
                <select
                  className="w-full rounded border px-3 py-1.5 text-xs"
                  style={{ borderColor: '#1a2842', color: '#eef2f8', fontFamily: 'monospace', backgroundColor: '#0d1420' }}
                  value={form.project_id}
                  onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
                >
                  <option value="">None</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-1.5 rounded text-xs"
                style={{ border: '1px solid #1a2842', color: '#5d6b85', fontFamily: 'monospace' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-1.5 rounded text-xs font-medium"
                style={{ backgroundColor: '#5B9BFF', color: '#070a12', fontFamily: 'monospace' }}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

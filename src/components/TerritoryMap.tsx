'use client'

/**
 * TerritoryMap — Full interactive Leaflet + OpenStreetMap map
 *
 * Features:
 * - Full Leaflet map with OSM tiles (no API key needed)
 * - Clickable to expand into a full-screen modal
 * - Preview map is fully interactive (scroll to zoom, drag to pan)
 * - Apex footholds (FL/OH/MS) shown as blue pulsing markers
 * - Buildvance leads shown as green markers
 * - Braik targets shown as orange markers
 * - Target zones: click anywhere on expanded map to place a zone of interest
 *   with shaded radius circle. Click an existing zone to remove it.
 */

import { useEffect, useRef, useState } from 'react'
import { X, Maximize2, MapPin, Target, Building2 } from 'lucide-react'

interface MapPoint {
  lat: number
  lng: number
  type: 'buildvance' | 'braik'
}

interface TargetZone {
  id: string
  lat: number
  lng: number
  type: 'buildvance' | 'braik' | 'general'
  label: string
  radius: number
}

interface Props {
  points?: MapPoint[]
}

const FOOTHOLDS = [
  { name: 'Tampa Bay, FL (HQ)', lat: 27.9506, lng: -82.4572, color: '#5B9BFF' },
  { name: 'Ohio',               lat: 40.4173, lng: -82.9071, color: '#5B9BFF' },
  { name: 'Mississippi',        lat: 32.3547, lng: -89.3985, color: '#5B9BFF' },
]

export default function TerritoryMap({ points = [] }: Props) {
  const previewRef  = useRef<HTMLDivElement>(null)
  const expandedRef = useRef<HTMLDivElement>(null)
  const previewMap  = useRef<any>(null)
  const expandedMap = useRef<any>(null)
  const [expanded, setExpanded]         = useState(false)
  const [zones, setZones]               = useState<TargetZone[]>([])
  const [placeMode, setPlaceMode]       = useState<'buildvance' | 'braik' | 'general' | null>(null)
  const [leafletReady, setLeafletReady] = useState(false)
  const expandedLayerGroup = useRef<any>(null)

  // Load Leaflet CSS + JS once
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).L) { setLeafletReady(true); return }

    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setLeafletReady(true)
    document.head.appendChild(script)
  }, [])

  const ZONE_COLORS: Record<string, string> = {
    buildvance: '#00C97A',
    braik:      '#FF7A33',
    general:    '#5B9BFF',
  }

  function makeIcon(L: any, color: string, size = 10) {
    return L.divIcon({
      className: '',
      html: `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};border:2px solid white;
        box-shadow:0 0 6px ${color}88;
      "></div>`,
      iconSize:   [size, size],
      iconAnchor: [size / 2, size / 2],
    })
  }

  function makeFootholdIcon(L: any) {
    return L.divIcon({
      className: '',
      html: `<div style="
        width:14px;height:14px;border-radius:50%;
        background:#5B9BFF;border:2.5px solid white;
        box-shadow:0 0 10px #5B9BFF99;
        animation:pulse-map 2s ease-in-out infinite;
      "></div>`,
      iconSize:   [14, 14],
      iconAnchor: [7, 7],
    })
  }

  function buildMap(L: any, container: HTMLElement, zoom: number, interactive: boolean) {
    const map = L.map(container, {
      zoomControl: interactive,
      scrollWheelZoom: interactive,
      dragging: interactive,
      doubleClickZoom: interactive,
    }).setView([38.5, -96], zoom)

    // Standard OSM tiles — more reliable than CartoDB dark which caused blank map
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    })
    tiles.on('tileerror', () => {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)
    })
    tiles.addTo(map)

    FOOTHOLDS.forEach(({ name, lat, lng }) => {
      L.marker([lat, lng], { icon: makeFootholdIcon(L) })
        .addTo(map)
        .bindPopup(`<b style="font-family:sans-serif;font-size:12px;color:#1a1f2e">${name}</b><br><span style="font-size:11px;color:#5B9BFF">Apex Foothold</span>`)
    })

    points.forEach(({ lat, lng, type }) => {
      if (!lat || !lng) return
      const color = type === 'buildvance' ? '#00C97A' : '#FF7A33'
      L.marker([lat, lng], { icon: makeIcon(L, color) }).addTo(map)
    })

    return map
  }

  function renderZones(L: any, map: any, layerGroup: any) {
    layerGroup.clearLayers()
    zones.forEach((z) => {
      const color = ZONE_COLORS[z.type]
      const circle = L.circle([z.lat, z.lng], {
        radius: z.radius, color, fillColor: color, fillOpacity: 0.12, weight: 1.5, opacity: 0.5,
      }).addTo(layerGroup)
      const marker = L.marker([z.lat, z.lng], { icon: makeIcon(L, color, 8) }).addTo(layerGroup)
      void circle
      marker.bindPopup(
        `<b style="font-size:12px;color:#1a1f2e">${z.label}</b><br>
         <span style="font-size:11px;color:${color}">${z.type} target zone</span><br>
         <button onclick="window.removeZone('${z.id}')"
           style="margin-top:6px;font-size:11px;cursor:pointer;border:none;background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:4px">
           Remove
         </button>`
      )
    })
  }

  // Preview map — interactive (scroll + drag)
  useEffect(() => {
    if (!leafletReady || !previewRef.current || previewMap.current) return
    const L = (window as any).L
    previewMap.current = buildMap(L, previewRef.current, 4, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady])

  // Expanded map
  useEffect(() => {
    if (!expanded || !leafletReady || !expandedRef.current) return
    const L = (window as any).L

    if (!expandedMap.current) {
      expandedMap.current = buildMap(L, expandedRef.current, 5, true)
      expandedLayerGroup.current = L.layerGroup().addTo(expandedMap.current)

      expandedMap.current.on('click', (e: any) => {
        if (!placeMode) return
        const id    = Date.now().toString()
        const label = `${placeMode.charAt(0).toUpperCase() + placeMode.slice(1)} zone`
        setZones((prev) => [...prev, { id, lat: e.latlng.lat, lng: e.latlng.lng, type: placeMode, label, radius: 80000 }])
      })

      ;(window as any).removeZone = (id: string) => setZones((prev) => prev.filter((z) => z.id !== id))
    } else {
      setTimeout(() => expandedMap.current?.invalidateSize(), 50)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, leafletReady])

  // Re-render zones when they change
  useEffect(() => {
    if (!expandedMap.current || !expandedLayerGroup.current || !leafletReady) return
    const L = (window as any).L
    renderZones(L, expandedMap.current, expandedLayerGroup.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones, leafletReady])

  // Update click handler when placeMode changes
  useEffect(() => {
    if (!expandedMap.current) return
    expandedMap.current.off('click')
    expandedMap.current.on('click', (e: any) => {
      if (!placeMode) return
      const id    = Date.now().toString()
      const label = `${placeMode.charAt(0).toUpperCase() + placeMode.slice(1)} zone`
      setZones((prev) => [...prev, { id, lat: e.latlng.lat, lng: e.latlng.lng, type: placeMode, label, radius: 80000 }])
    })
  }, [placeMode])

  return (
    <>
      <style>{`
        @keyframes pulse-map {
          0%,100% { box-shadow: 0 0 0 0 rgba(91,155,255,0.6); }
          50%      { box-shadow: 0 0 0 6px rgba(91,155,255,0); }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
        }
      `}</style>

      {/* Preview (dashboard card) */}
      <div style={{ position: 'relative' }}>
        <div ref={previewRef} style={{ height: 200, borderRadius: 8, overflow: 'hidden', background: '#1a2035' }} />
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1.5 font-display uppercase"
          style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'var(--shell-bg)', color: 'var(--apex)',
            border: '1px solid var(--shell-border)',
            borderRadius: 6, padding: '4px 10px', fontSize: 10,
            letterSpacing: '0.06em', cursor: 'pointer', zIndex: 1000,
          }}
        >
          <Maximize2 size={11} /> Expand map
        </button>
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(13,27,61,0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false) }}
        >
          <div style={{
            width: '90vw', height: '85vh', background: '#0d1b3d',
            borderRadius: 12, border: '1px solid rgba(91,155,255,0.25)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}>
            {/* Modal top bar */}
            <div style={{
              padding: '10px 16px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', borderBottom: '1px solid rgba(91,155,255,0.15)',
              background: 'var(--shell-bg)', flexShrink: 0,
            }}>
              <span className="font-display" style={{ color: 'var(--apex)', fontSize: 14, letterSpacing: '0.08em' }}>
                TERRITORY MAP
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="font-display" style={{ color: 'var(--shell-ink-muted)', fontSize: 10, letterSpacing: '0.06em' }}>
                  PLACE ZONE:
                </span>
                {[
                  { type: 'buildvance' as const, color: '#00C97A', icon: <Building2 size={11} /> },
                  { type: 'braik'      as const, color: '#FF7A33', icon: <Target     size={11} /> },
                  { type: 'general'    as const, color: '#5B9BFF', icon: <MapPin     size={11} /> },
                ].map(({ type, color, icon }) => (
                  <button
                    key={type}
                    onClick={() => setPlaceMode(placeMode === type ? null : type)}
                    className="font-display uppercase"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 6, fontSize: 10,
                      letterSpacing: '0.06em', cursor: 'pointer',
                      background: placeMode === type ? `${color}22` : 'transparent',
                      color: placeMode === type ? color : 'var(--shell-ink-dim)',
                      border: `1px solid ${placeMode === type ? color : 'rgba(91,155,255,0.2)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    {icon} {type}
                  </button>
                ))}
                {zones.length > 0 && (
                  <button
                    onClick={() => setZones([])}
                    className="font-display uppercase"
                    style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 10,
                      background: 'rgba(220,38,38,0.1)', color: '#ef4444',
                      border: '1px solid rgba(220,38,38,0.3)', cursor: 'pointer',
                    }}
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => { setExpanded(false); setPlaceMode(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-ink-muted)', padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Place-mode hint */}
            {placeMode && (
              <div style={{
                background: `${ZONE_COLORS[placeMode]}18`,
                borderBottom: `1px solid ${ZONE_COLORS[placeMode]}44`,
                padding: '6px 16px', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <MapPin size={12} color={ZONE_COLORS[placeMode]} />
                <span className="font-display" style={{ color: ZONE_COLORS[placeMode], fontSize: 11, letterSpacing: '0.04em' }}>
                  Click anywhere on the map to place a {placeMode} target zone.
                </span>
              </div>
            )}

            {/* Legend */}
            <div style={{
              display: 'flex', gap: 16, padding: '6px 16px', flexShrink: 0,
              borderBottom: '1px solid rgba(91,155,255,0.1)',
              background: 'rgba(13,27,61,0.6)',
            }}>
              {[
                { label: 'Apex foothold',    color: '#5B9BFF' },
                { label: 'Buildvance lead',  color: '#00C97A' },
                { label: 'Braik target',     color: '#FF7A33' },
                { label: 'Buildvance zone',  color: '#00C97A', dashed: true },
                { label: 'Braik zone',       color: '#FF7A33', dashed: true },
                { label: 'General zone',     color: '#5B9BFF', dashed: true },
              ].map(({ label, color, dashed }) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--shell-ink-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{
                    width: dashed ? 14 : 8, height: dashed ? 14 : 8, borderRadius: '50%',
                    background: dashed ? `${color}22` : color,
                    border: dashed ? `1.5px dashed ${color}` : 'none',
                    display: 'inline-block', flexShrink: 0,
                  }} />
                  {label}
                </span>
              ))}
            </div>

            {/* Map container */}
            <div ref={expandedRef} style={{ flex: 1 }} />
          </div>
        </div>
      )}
    </>
  )
}

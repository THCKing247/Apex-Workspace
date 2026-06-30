'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'

interface MapPoint {
  lat: number
  lng: number
  label?: string
  type: 'foothold' | 'buildvance' | 'braik'
}

interface TerritoryMapProps {
  points: MapPoint[]
}

const FOOTHOLDS = [
  { name: 'Florida', lat: 27.8, lng: -81.6, type: 'foothold' as const },
  { name: 'Ohio', lat: 40.4, lng: -82.9, type: 'foothold' as const },
  { name: 'Mississippi', lat: 32.7, lng: -89.7, type: 'foothold' as const },
]

const FOOTHOLD_STATES = ['Florida', 'Ohio', 'Mississippi']

const TYPE_COLOR: Record<MapPoint['type'], string> = {
  foothold: '#5B9BFF',
  buildvance: '#00E08A',
  braik: '#FF7A33',
}

export default function TerritoryMap({ points }: TerritoryMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const width = 975
    const height = 610

    const projection = d3.geoAlbersUsa().scale(1300).translate([width / 2, height / 2])
    const path = d3.geoPath().projection(projection)

    // IMPORTANT: use the UNPROJECTED states-10m.json here, not states-albers-10m.json.
    // The "-albers-" file ships pre-projected pixel coordinates already fit to a 975x610
    // viewport with NO projection applied on render. Running d3.geoAlbersUsa() over those
    // pre-projected coordinates double-projects them, producing scattered crisscrossing
    // lines instead of state shapes. Using the raw (unprojected, lat/lng-based) topology
    // here means geoAlbersUsa is applied exactly once, consistently, for both the state
    // paths AND the lat/lng dot markers below -- so everything lines up on the same map.
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then((r) => r.json())
      .then((us: Topology<{ states: GeometryCollection<{ name: string }> }>) => {
        const states = topojson.feature(us, us.objects.states)

        const sel = d3.select(svg)
        sel.selectAll('*').remove()

        sel
          .selectAll('path')
          .data((states as GeoJSON.FeatureCollection).features)
          .join('path')
          .attr('d', path as (d: unknown) => string)
          .attr('fill', (d) => {
            const name = (d as GeoJSON.Feature<GeoJSON.Geometry, { name: string }>).properties?.name
            return FOOTHOLD_STATES.includes(name) ? 'rgba(91,155,255,0.18)' : '#0f1626'
          })
          .attr('stroke', '#1a2842')
          .attr('stroke-width', 0.5)

        // Foothold dots + labels
        FOOTHOLDS.forEach(({ name, lat, lng }) => {
          const coords = projection([lng, lat])
          if (!coords) return
          const [x, y] = coords
          sel
            .append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 5)
            .attr('fill', '#5B9BFF')
            .attr('opacity', 0.9)

          sel
            .append('text')
            .attr('x', x + 7)
            .attr('y', y + 4)
            .attr('font-size', 9)
            .attr('font-family', 'monospace')
            .attr('fill', '#8b95ab')
            .text(name)
        })

        // Lead/target dots from props
        points.forEach(({ lat, lng, type }) => {
          const coords = projection([lng, lat])
          if (!coords) return
          const [x, y] = coords
          sel
            .append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 4)
            .attr('fill', TYPE_COLOR[type])
            .attr('opacity', 0.85)
        })
      })
      .catch(() => {
        // Silently fail if atlas fetch fails (offline)
      })
  }, [points])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 975 610"
      className="w-full h-full"
      style={{ maxHeight: 260 }}
    />
  )
}

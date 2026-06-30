'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// ── Pipeline bar chart ────────────────────────────────────────────────────────

interface PipelineData {
  stage: string
  buildvance: number
  braik: number
}

export function PipelineChart({ data }: { data: PipelineData[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barCategoryGap="30%">
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#5d6b85' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0d1420', border: '1px solid #1a2842', borderRadius: 6, fontSize: 11 }}
          labelStyle={{ color: '#eef2f8' }}
        />
        <Bar dataKey="buildvance" name="Buildvance" fill="#00E08A" radius={[2, 2, 0, 0]} />
        <Bar dataKey="braik" name="Braik" fill="#FF7A33" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Activity line chart ───────────────────────────────────────────────────────

interface ActivityData {
  day: string
  buildvance: number
  braik: number
}

export function ActivityChart({ data }: { data: ActivityData[] }) {
  const hasActivity = data.some((d) => d.buildvance > 0 || d.braik > 0)
  const shortDays = data.map((d) => ({
    ...d,
    day: new Date(d.day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(),
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={shortDays}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#5d6b85' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0d1420', border: '1px solid #1a2842', borderRadius: 6, fontSize: 11 }}
            labelStyle={{ color: '#eef2f8' }}
          />
          <Legend
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: 9, fontFamily: 'monospace', color: '#5d6b85' }}
          />
          <Line
            type="monotone"
            dataKey="buildvance"
            name="Buildvance"
            stroke="#00E08A"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="braik"
            name="Braik"
            stroke="#FF7A33"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {!hasActivity && (
        <p
          className="absolute inset-0 flex items-center justify-center text-xs"
          style={{ color: '#5d6b85', fontFamily: 'monospace' }}
        >
          No activity yet
        </p>
      )}
    </div>
  )
}

// ── Gauge / doughnut ──────────────────────────────────────────────────────────

interface GaugeProps {
  value: number | null
  label: string
  color: string
}

export function Gauge({ value, label, color }: GaugeProps) {
  const pct = value ?? 0
  const data = [{ value: pct }, { value: 100 - pct }]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <PieChart width={90} height={90}>
          <Pie
            data={data}
            cx={40}
            cy={40}
            startAngle={90}
            endAngle={-270}
            innerRadius={28}
            outerRadius={38}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={value !== null ? color : '#374151'} />
            <Cell fill="#1a2842" />
          </Pie>
        </PieChart>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-bold"
          style={{ fontFamily: 'monospace', color: value !== null ? '#eef2f8' : '#5d6b85' }}
        >
          {value !== null ? `${pct}%` : '—'}
        </span>
      </div>
      <span className="text-xs" style={{ fontFamily: 'monospace', color: '#5d6b85', letterSpacing: '0.05em' }}>
        {label}
      </span>
    </div>
  )
}

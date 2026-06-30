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

// All chart colors use explicit hex — recharts/canvas can't read CSS variables.
const BUILDVANCE = '#00E08A'
const BRAIK = '#FF7A33'
const APEX = '#5B9BFF'

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
          tick={{ fontSize: 11, fontFamily: 'var(--font-teko)', fill: '#5f73a3' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#10204a',
            border: '1px solid rgba(91,155,255,0.3)',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'var(--font-teko)',
          }}
          labelStyle={{ color: '#f4f8ff' }}
        />
        <Bar dataKey="buildvance" name="Buildvance" fill={BUILDVANCE} radius={[2, 2, 0, 0]} />
        <Bar dataKey="braik" name="Braik" fill={BRAIK} radius={[2, 2, 0, 0]} />
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
    day: new Date(d.day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={shortDays}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fontFamily: 'var(--font-teko)', fill: '#5f73a3' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#10204a',
              border: '1px solid rgba(91,155,255,0.3)',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'var(--font-teko)',
            }}
            labelStyle={{ color: '#f4f8ff' }}
          />
          <Legend
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-teko)', color: '#5f73a3', textTransform: 'uppercase' }}
          />
          <Line type="monotone" dataKey="buildvance" name="Buildvance" stroke={BUILDVANCE} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="braik" name="Braik" stroke={BRAIK} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      {!hasActivity && (
        <p
          className="absolute inset-0 flex items-center justify-center uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-teko)', fontSize: 13, color: '#3d4f87' }}
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
  const gaugeColor = color === 'apex' ? APEX : color === 'buildvance' ? BUILDVANCE : color === 'braik' ? BRAIK : color
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
            <Cell fill={value !== null ? gaugeColor : '#3d4f87'} />
            <Cell fill="rgba(91,155,255,0.1)" />
          </Pie>
        </PieChart>
        <span
          className="absolute inset-0 flex items-center justify-center font-semibold"
          style={{ fontFamily: 'var(--font-teko)', fontSize: 16, color: value !== null ? '#f4f8ff' : '#3d4f87' }}
        >
          {value !== null ? `${pct}%` : '—'}
        </span>
      </div>
      <span
        className="uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-teko)', fontSize: 10, color: '#5f73a3', letterSpacing: '0.05em' }}
      >
        {label}
      </span>
    </div>
  )
}

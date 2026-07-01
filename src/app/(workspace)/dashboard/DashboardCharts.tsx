'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts'

interface PipelineData { stage: string; buildvance: number; braik: number }
interface ActivityData  { day: string;  buildvance: number; braik: number }

// Explicit hex colors — recharts/canvas can't read CSS variables
const BV = '#00C97A'
const BR = '#FF7A33'
const AP = '#5B9BFF'

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: '1px solid #e8e6df',
    borderRadius: 8,
    fontSize: 11,
    boxShadow: '0 4px 12px rgba(13,27,61,0.1)',
  },
  labelStyle: { color: '#1a1f2e' },
  itemStyle:  { color: '#4b5674' },
}

export function PipelineChart({ data }: { data: PipelineData[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barCategoryGap="30%">
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 9, fontFamily: 'var(--font-display)', fill: '#8892aa', letterSpacing: '0.04em' }}
          axisLine={false} tickLine={false}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="buildvance" name="Buildvance" fill={BV} radius={[3, 3, 0, 0]} />
        <Bar dataKey="braik"      name="Braik"      fill={BR} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ActivityChart({ data }: { data: ActivityData[] }) {
  const hasActivity = data.some((d) => d.buildvance > 0 || d.braik > 0)
  const shortDays = data.map((d) => ({
    ...d,
    day: new Date(d.day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(),
  }))

  return (
    <div className="relative" style={{ marginTop: 8 }}>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={shortDays}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fontFamily: 'var(--font-display)', fill: '#8892aa', letterSpacing: '0.04em' }}
            axisLine={false} tickLine={false}
          />
          <YAxis hide allowDecimals={false} />
          <Tooltip {...tooltipStyle} />
          <Legend
            iconType="circle" iconSize={6}
            wrapperStyle={{ fontSize: 10, fontFamily: 'var(--font-display)', color: '#8892aa', letterSpacing: '0.04em' }}
          />
          <Line type="monotone" dataKey="buildvance" name="Buildvance" stroke={BV} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="braik"      name="Braik"      stroke={BR} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      {!hasActivity && (
        <p
          className="absolute inset-0 flex items-center justify-center font-display uppercase"
          style={{ color: '#8892aa', fontSize: 12, letterSpacing: '0.06em', pointerEvents: 'none' }}
        >
          No activity yet
        </p>
      )}
    </div>
  )
}

export function Gauge({ value, label, color }: { value: number | null; label: string; color: string }) {
  const pct  = value ?? 0
  // Resolve CSS variable names to hex for recharts canvas
  const resolvedColor = color === 'var(--apex)' ? AP : color === 'var(--buildvance)' ? BV : color === 'var(--braik)' ? BR : color
  const data = [{ value: pct }, { value: 100 - pct }]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <PieChart width={90} height={90}>
          <Pie
            data={data} cx={40} cy={40}
            startAngle={90} endAngle={-270}
            innerRadius={28} outerRadius={38}
            dataKey="value" strokeWidth={0}
          >
            <Cell fill={value !== null ? resolvedColor : '#c4c9d6'} />
            <Cell fill="#f0eeea" />
          </Pie>
        </PieChart>
        <span
          className="absolute inset-0 flex items-center justify-center font-display"
          style={{ color: value !== null ? '#1a1f2e' : '#8892aa', fontSize: 15, fontWeight: 600 }}
        >
          {value !== null ? `${pct}%` : '—'}
        </span>
      </div>
      <span
        className="font-display uppercase tracking-widest"
        style={{ color: '#8892aa', fontSize: 10, letterSpacing: '0.08em' }}
      >
        {label}
      </span>
    </div>
  )
}

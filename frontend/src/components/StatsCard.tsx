import type { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: number
  accent?: 'default' | 'red' | 'green' | 'amber' | 'blue'
  icon?: ReactNode
  subtitle?: string
  trend?: { value: number; label: string }
}

const themes = {
  default: {
    bg: 'linear-gradient(135deg, #0f1c30 0%, #111f38 100%)',
    border: 'rgba(99,102,241,0.18)',
    glow: 'rgba(99,102,241,0.08)',
    num: '#e0e7ff',
    lbl: '#6366f1',
    iconBg: 'rgba(99,102,241,0.12)',
    iconBorder: 'rgba(99,102,241,0.2)',
    iconColor: '#818cf8',
    orbColor: '#6366f1',
  },
  red: {
    bg: 'linear-gradient(135deg, #1a0f0f 0%, #200d0d 100%)',
    border: 'rgba(248,113,113,0.2)',
    glow: 'rgba(248,113,113,0.06)',
    num: '#fecaca',
    lbl: '#f87171',
    iconBg: 'rgba(248,113,113,0.12)',
    iconBorder: 'rgba(248,113,113,0.2)',
    iconColor: '#f87171',
    orbColor: '#ef4444',
  },
  green: {
    bg: 'linear-gradient(135deg, #0a1f12 0%, #0c2416 100%)',
    border: 'rgba(34,197,94,0.2)',
    glow: 'rgba(34,197,94,0.06)',
    num: '#bbf7d0',
    lbl: '#4ade80',
    iconBg: 'rgba(34,197,94,0.12)',
    iconBorder: 'rgba(34,197,94,0.2)',
    iconColor: '#4ade80',
    orbColor: '#22c55e',
  },
  amber: {
    bg: 'linear-gradient(135deg, #1f1508 0%, #251a08 100%)',
    border: 'rgba(251,191,36,0.2)',
    glow: 'rgba(251,191,36,0.06)',
    num: '#fde68a',
    lbl: '#fbbf24',
    iconBg: 'rgba(251,191,36,0.12)',
    iconBorder: 'rgba(251,191,36,0.2)',
    iconColor: '#fbbf24',
    orbColor: '#f59e0b',
  },
  blue: {
    bg: 'linear-gradient(135deg, #0a1520 0%, #0c1a28 100%)',
    border: 'rgba(56,189,248,0.2)',
    glow: 'rgba(56,189,248,0.06)',
    num: '#bae6fd',
    lbl: '#38bdf8',
    iconBg: 'rgba(56,189,248,0.12)',
    iconBorder: 'rgba(56,189,248,0.2)',
    iconColor: '#38bdf8',
    orbColor: '#0ea5e9',
  },
}

export default function StatsCard({ label, value, accent = 'default', icon, subtitle, trend }: StatsCardProps) {
  const t = themes[accent]
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden fade-up"
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        boxShadow: `0 4px 24px ${t.glow}, 0 1px 0 rgba(255,255,255,0.03) inset`,
      }}
    >
      {/* Glow orb */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 pointer-events-none"
        style={{ background: t.orbColor, filter: 'blur(30px)' }} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-3xl font-bold tabular-nums tracking-tight leading-none mb-2"
            style={{ color: t.num }}>
            {value}
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: t.lbl }}>
            {label}
          </p>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: t.lbl, opacity: 0.6 }}>{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs mt-2 font-medium" style={{ color: trend.value >= 0 ? '#4ade80' : '#f87171' }}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: t.iconBg, border: `1px solid ${t.iconBorder}`, color: t.iconColor }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

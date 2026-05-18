interface BadgeProps {
  type: 'status' | 'priority'
  value: string
  size?: 'sm' | 'md'
}

const statusConfig: Record<string, {
  label: string; dot: string; bg: string; text: string; border: string
}> = {
  TODO:        { label: 'To Do',       dot: '#64748b', bg: 'rgba(100,116,139,0.1)',  text: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
  IN_PROGRESS: { label: 'In Progress', dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  DONE:        { label: 'Done',        dot: '#22c55e', bg: 'rgba(34,197,94,0.1)',    text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
}

const priorityConfig: Record<string, {
  label: string; icon: string; bg: string; text: string; border: string
}> = {
  LOW:    { label: 'Low',    icon: '↓', bg: 'rgba(56,189,248,0.1)',  text: '#38bdf8', border: 'rgba(56,189,248,0.2)' },
  MEDIUM: { label: 'Medium', icon: '→', bg: 'rgba(251,191,36,0.1)',  text: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  HIGH:   { label: 'High',   icon: '↑', bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.2)' },
}

export default function Badge({ type, value, size = 'sm' }: BadgeProps) {
  const px = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'

  if (type === 'status') {
    const c = statusConfig[value]
    if (!c) return (
      <span className={`inline-flex items-center rounded-full font-semibold ${px}`}
        style={{ background: 'rgba(100,116,139,0.1)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }}>
        {value}
      </span>
    )
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${px}`}
        style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
        <span className="w-1.5 h-1.5 rounded-full shrink-0 flex-none" style={{ background: c.dot }} />
        {c.label}
      </span>
    )
  }

  const c = priorityConfig[value]
  if (!c) return (
    <span className={`inline-flex items-center rounded-full font-semibold ${px}`}
      style={{ background: 'rgba(100,116,139,0.1)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }}>
      {value}
    </span>
  )
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${px}`}
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      <span className="font-bold leading-none">{c.icon}</span>
      {c.label}
    </span>
  )
}

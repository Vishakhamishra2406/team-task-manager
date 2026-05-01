interface StatsCardProps {
  label: string
  value: number
  accent?: 'default' | 'red' | 'green' | 'amber'
  icon?: string
}

const styles = {
  default: { bg: '#ffffff', border: '#e2e8f0', num: '#1e293b', lbl: '#64748b', icon: '#6366f1' },
  red:     { bg: '#fff1f2', border: '#fecdd3', num: '#be123c', lbl: '#e11d48', icon: '#f43f5e' },
  green:   { bg: '#f0fdf4', border: '#bbf7d0', num: '#15803d', lbl: '#16a34a', icon: '#22c55e' },
  amber:   { bg: '#fffbeb', border: '#fde68a', num: '#b45309', lbl: '#d97706', icon: '#f59e0b' },
}

export default function StatsCard({ label, value, accent = 'default', icon }: StatsCardProps) {
  const s = styles[accent]
  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      {icon && <p className="text-xl mb-3">{icon}</p>}
      <p className="text-3xl font-bold tabular-nums" style={{ color: s.num }}>{value}</p>
      <p className="text-xs font-semibold mt-1.5 uppercase tracking-wide" style={{ color: s.lbl }}>{label}</p>
    </div>
  )
}

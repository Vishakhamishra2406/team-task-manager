interface StatsCardProps {
  label: string
  value: number
  accent?: 'default' | 'red' | 'green' | 'amber'
  icon?: string
}

const styles = {
  default: { wrap: 'bg-white border-stone-200',   num: 'text-stone-900', lbl: 'text-stone-500' },
  red:     { wrap: 'bg-rose-50 border-rose-100',  num: 'text-rose-700',  lbl: 'text-rose-500' },
  green:   { wrap: 'bg-emerald-50 border-emerald-100', num: 'text-emerald-700', lbl: 'text-emerald-600' },
  amber:   { wrap: 'bg-amber-50 border-amber-100', num: 'text-amber-700', lbl: 'text-amber-600' },
}

export default function StatsCard({ label, value, accent = 'default', icon }: StatsCardProps) {
  const s = styles[accent]
  return (
    <div className={`rounded-2xl border p-5 ${s.wrap}`}>
      {icon && <p className="text-2xl mb-2">{icon}</p>}
      <p className={`text-3xl font-bold tabular-nums ${s.num}`}>{value}</p>
      <p className={`text-xs font-medium mt-1 ${s.lbl}`}>{label}</p>
    </div>
  )
}

interface BadgeProps {
  type: 'status' | 'priority'
  value: string
}

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  TODO:        { label: 'To Do',       dot: 'bg-stone-400',   bg: 'bg-stone-100',   text: 'text-stone-600' },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-amber-400',   bg: 'bg-amber-50',    text: 'text-amber-700' },
  DONE:        { label: 'Done',        dot: 'bg-emerald-400', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
}

const priorityConfig: Record<string, { label: string; bg: string; text: string }> = {
  LOW:    { label: 'Low',    bg: 'bg-sky-50',    text: 'text-sky-600' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-50',  text: 'text-amber-600' },
  HIGH:   { label: 'High',   bg: 'bg-rose-50',   text: 'text-rose-600' },
}

export default function Badge({ type, value }: BadgeProps) {
  if (type === 'status') {
    const c = statusConfig[value]
    if (!c) return <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">{value}</span>
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    )
  }

  const c = priorityConfig[value]
  if (!c) return <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-stone-100 text-stone-600">{value}</span>
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

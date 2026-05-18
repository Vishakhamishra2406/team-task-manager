import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronRight, ClipboardList, AlertCircle, CheckCircle2,
  Activity, Users, TrendingUp, ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Layout from '../components/Layout'
import StatsCard from '../components/StatsCard'
import Avatar from '../components/Avatar'

interface UserDTO { id: string; name: string; email: string }
interface DashboardDTO {
  total: number
  byStatus: { status: string; count: number }[]
  overdue: number
  tasksByUser: { user: UserDTO; count: number }[]
}

const statusMeta: Record<string, { label: string; barColor: string; trackColor: string; dotColor: string }> = {
  TODO:        { label: 'To Do',       barColor: '#475569', trackColor: 'rgba(71,85,105,0.15)',  dotColor: '#64748b' },
  IN_PROGRESS: { label: 'In Progress', barColor: '#f59e0b', trackColor: 'rgba(245,158,11,0.15)', dotColor: '#fbbf24' },
  DONE:        { label: 'Done',        barColor: '#22c55e', trackColor: 'rgba(34,197,94,0.15)',  dotColor: '#4ade80' },
}

function DashSkeleton() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="skeleton h-28 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="skeleton h-56 rounded-2xl" />
          <div className="skeleton h-56 rounded-2xl" />
        </div>
      </div>
    </Layout>
  )
}

/** Animated radial progress ring */
function ProgressRing({ pct, size = 80, stroke = 7, color = '#6366f1' }: {
  pct: number; size?: number; stroke?: number; color?: string
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(99,102,241,0.1)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  )
}

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<DashboardDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get<DashboardDTO>(`/api/dashboard/${id}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <DashSkeleton />

  const donePct = data && data.total > 0
    ? Math.round(((data.byStatus.find(s => s.status === 'DONE')?.count ?? 0) / data.total) * 100)
    : 0

  const doneCount = data?.byStatus.find(s => s.status === 'DONE')?.count ?? 0
  const inProgressCount = data?.byStatus.find(s => s.status === 'IN_PROGRESS')?.count ?? 0
  const todoCount = data?.byStatus.find(s => s.status === 'TODO')?.count ?? 0

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ───────────────────────────── */}
        <div
          className="rounded-2xl px-7 py-6 fade-up relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d1a35 0%, #111f3e 50%, #0f1c30 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{ background: '#6366f1', filter: 'blur(40px)' }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] mb-3" style={{ color: '#3d5a7a' }}>
                <Link to="/projects" className="transition-colors hover:text-indigo-400">Projects</Link>
                <ChevronRight size={11} />
                <Link to={`/projects/${id}`} className="transition-colors hover:text-indigo-400">Project</Link>
                <ChevronRight size={11} />
                <span style={{ color: '#818cf8' }}>Dashboard</span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#4f46e5' }}>
                Analytics
              </p>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: '#f0f4ff' }}>
                Project Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Track progress and team performance
              </p>
            </div>
            <Link
              to={`/projects/${id}`}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all self-start sm:self-auto"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)' }}
            >
              <ArrowLeft size={13} />
              Back to project
            </Link>
          </div>
        </div>

        {data && (
          <>
            {/* ── Stats cards ──────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatsCard
                label="Total Tasks"
                value={data.total}
                accent="default"
                icon={<ClipboardList size={16} />}
              />
              <StatsCard
                label="Overdue"
                value={data.overdue}
                accent={data.overdue > 0 ? 'red' : 'default'}
                icon={<AlertCircle size={16} />}
                subtitle={data.overdue > 0 ? 'Needs attention' : 'All on track'}
              />
              <StatsCard
                label="Completed"
                value={doneCount}
                accent="green"
                icon={<CheckCircle2 size={16} />}
                subtitle={`${donePct}% of total`}
              />
              <StatsCard
                label="In Progress"
                value={inProgressCount}
                accent="amber"
                icon={<Activity size={16} />}
              />
            </div>

            {/* ── Middle row ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Completion ring + breakdown */}
              <section
                className="rounded-2xl p-6 fade-up stagger-1"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <TrendingUp size={15} style={{ color: '#6366f1' }} />
                  <h2 className="text-sm font-bold" style={{ color: '#e0e7ff' }}>Status Breakdown</h2>
                </div>

                {data.total === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <ClipboardList size={24} className="mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tasks yet</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    {/* Ring */}
                    <div className="relative shrink-0">
                      <ProgressRing pct={donePct} size={88} stroke={8} color="#22c55e" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold" style={{ color: '#4ade80' }}>{donePct}%</span>
                        <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>done</span>
                      </div>
                    </div>

                    {/* Bars */}
                    <div className="flex-1 space-y-3.5">
                      {['TODO', 'IN_PROGRESS', 'DONE'].map(status => {
                        const count = data.byStatus.find(s => s.status === status)?.count ?? 0
                        const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0
                        const meta = statusMeta[status]
                        return (
                          <div key={status}>
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                              <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#c7d2fe' }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dotColor }} />
                                {meta.label}
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>{count} · {pct}%</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: meta.trackColor }}>
                              <div
                                className="h-full rounded-full progress-bar"
                                style={{ width: `${pct}%`, background: meta.barColor }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* Quick summary card */}
              <section
                className="rounded-2xl p-6 fade-up stagger-2"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <Activity size={15} style={{ color: '#6366f1' }} />
                  <h2 className="text-sm font-bold" style={{ color: '#e0e7ff' }}>Task Summary</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'To Do',       count: todoCount,       color: '#64748b', bg: 'rgba(71,85,105,0.1)',  border: 'rgba(71,85,105,0.2)' },
                    { label: 'In Progress', count: inProgressCount, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                    { label: 'Completed',   count: doneCount,       color: '#4ade80', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)' },
                    { label: 'Overdue',     count: data.overdue,    color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
                  ].map(row => (
                    <div key={row.label}
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{ background: row.bg, border: `1px solid ${row.border}` }}>
                      <span className="text-xs font-semibold" style={{ color: row.color }}>{row.label}</span>
                      <span className="text-lg font-bold tabular-nums" style={{ color: row.color }}>{row.count}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ── Tasks per member ─────────────── */}
            <section
              className="rounded-2xl p-6 fade-up stagger-3"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2.5 mb-5">
                <Users size={15} style={{ color: '#6366f1' }} />
                <h2 className="text-sm font-bold" style={{ color: '#e0e7ff' }}>Tasks per Member</h2>
                <span className="ml-auto text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {data.tasksByUser.filter(r => r.user).length} members
                </span>
              </div>

              {data.tasksByUser.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Users size={24} className="mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No assigned tasks</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.tasksByUser
                    .filter(r => r.user)
                    .sort((a, b) => b.count - a.count)
                    .map((row, i) => {
                      const maxCount = Math.max(...data.tasksByUser.map(r => r.count))
                      const barPct = maxCount > 0 ? (row.count / maxCount) * 100 : 0
                      return (
                        <div
                          key={row.user.id}
                          className="flex items-center gap-4 rounded-xl px-4 py-3 transition-colors"
                          style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.08)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
                        >
                          {/* Rank */}
                          <span className="text-xs font-bold w-4 shrink-0 text-center"
                            style={{ color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : 'var(--text-muted)' }}>
                            {i + 1}
                          </span>

                          <Avatar name={row.user.name} size="sm" />

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: '#e0e7ff' }}>
                              {row.user.name}
                            </p>
                            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                              {row.user.email}
                            </p>
                          </div>

                          {/* Bar */}
                          <div className="flex-1 max-w-[120px] hidden sm:block">
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
                              <div className="h-full rounded-full progress-bar"
                                style={{ width: `${barPct}%`, background: 'linear-gradient(90deg,#6366f1,#3b82f6)' }} />
                            </div>
                          </div>

                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}
                          >
                            {row.count}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  )
}

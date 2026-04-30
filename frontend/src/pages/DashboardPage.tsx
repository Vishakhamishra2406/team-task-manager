import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Layout from '../components/Layout'
import StatsCard from '../components/StatsCard'

interface UserDTO { id: string; name: string; email: string }
interface DashboardDTO {
  total: number
  byStatus: { status: string; count: number }[]
  overdue: number
  tasksByUser: { user: UserDTO; count: number }[]
}

const statusMeta: Record<string, { label: string; bar: string }> = {
  TODO:        { label: 'To Do',       bar: 'bg-stone-300' },
  IN_PROGRESS: { label: 'In Progress', bar: 'bg-amber-400' },
  DONE:        { label: 'Done',        bar: 'bg-emerald-400' },
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

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Breadcrumb + title */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-2">
            <Link to="/projects" className="hover:text-violet-600 transition-colors">Projects</Link>
            <span>/</span>
            <Link to={`/projects/${id}`} className="hover:text-violet-600 transition-colors">Project</Link>
            <span>/</span>
            <span className="text-stone-600 font-medium">Dashboard</span>
          </div>
          <h1 className="text-xl font-bold text-stone-900">Dashboard</h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatsCard label="Total tasks" value={data.total} icon="📋" />
              <StatsCard label="Overdue" value={data.overdue} accent={data.overdue > 0 ? 'red' : 'default'} icon="⏰" />
              <StatsCard label="Done" value={data.byStatus.find(s => s.status === 'DONE')?.count ?? 0} accent="green" icon="✅" />
              <StatsCard label="In progress" value={data.byStatus.find(s => s.status === 'IN_PROGRESS')?.count ?? 0} accent="amber" icon="🔄" />
            </div>

            {/* Status breakdown */}
            <section className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="text-sm font-bold text-stone-800 mb-4">Status breakdown</h2>
              {data.total === 0 ? (
                <p className="text-sm text-stone-400">No tasks yet.</p>
              ) : (
                <div className="space-y-3">
                  {['TODO', 'IN_PROGRESS', 'DONE'].map(status => {
                    const count = data.byStatus.find(s => s.status === status)?.count ?? 0
                    const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0
                    const meta = statusMeta[status]
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-stone-700">{meta.label}</span>
                          <span className="text-stone-400">{count} · {pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${meta.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Tasks per user */}
            <section className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="text-sm font-bold text-stone-800 mb-4">Tasks per member</h2>
              {data.tasksByUser.length === 0 ? (
                <p className="text-sm text-stone-400">No assigned tasks.</p>
              ) : (
                <ul className="space-y-2">
                  {data.tasksByUser
                    .filter(r => r.user)
                    .sort((a, b) => b.count - a.count)
                    .map(row => (
                      <li key={row.user.id} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {row.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">{row.user.name}</p>
                          <p className="text-xs text-stone-400 truncate">{row.user.email}</p>
                        </div>
                        <span className="text-sm font-bold text-violet-600 shrink-0">{row.count}</span>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  )
}

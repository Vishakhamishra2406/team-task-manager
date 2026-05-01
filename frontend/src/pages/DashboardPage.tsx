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

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  TODO:        { label: 'To Do',       color: '#64748b', bg: '#e2e8f0' },
  IN_PROGRESS: { label: 'In Progress', color: '#d97706', bg: '#fbbf24' },
  DONE:        { label: 'Done',        color: '#15803d', bg: '#4ade80' },
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

        {/* Header */}
        <div className="rounded-2xl px-7 py-6 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #1e3a5f 100%)' }}>
          <div className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: '#818cf8' }}>
            <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
            <span>/</span>
            <Link to={`/projects/${id}`} className="hover:text-white transition-colors">Project</Link>
            <span>/</span>
            <span style={{ color: '#c7d2fe' }}>Dashboard</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#818cf8' }}>Analytics</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: '#a5b4fc' }}>Track progress and team performance</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatsCard label="Total Tasks" value={data.total} icon="📋" />
              <StatsCard label="Overdue" value={data.overdue} accent={data.overdue > 0 ? 'red' : 'default'} icon="⏰" />
              <StatsCard label="Done" value={data.byStatus.find(s => s.status === 'DONE')?.count ?? 0} accent="green" icon="✅" />
              <StatsCard label="In Progress" value={data.byStatus.find(s => s.status === 'IN_PROGRESS')?.count ?? 0} accent="amber" icon="🔄" />
            </div>

            {/* Status breakdown */}
            <section className="rounded-2xl p-6 shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
              <h2 className="text-sm font-bold mb-5" style={{ color: '#1e293b' }}>Status Breakdown</h2>
              {data.total === 0 ? (
                <p className="text-sm" style={{ color: '#94a3b8' }}>No tasks yet.</p>
              ) : (
                <div className="space-y-4">
                  {['TODO', 'IN_PROGRESS', 'DONE'].map(status => {
                    const count = data.byStatus.find(s => s.status === status)?.count ?? 0
                    const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0
                    const meta = statusMeta[status]
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold" style={{ color: '#334155' }}>{meta.label}</span>
                          <span style={{ color: '#94a3b8' }}>{count} tasks · {pct}%</span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: meta.bg }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Tasks per user */}
            <section className="rounded-2xl p-6 shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
              <h2 className="text-sm font-bold mb-5" style={{ color: '#1e293b' }}>Tasks per Member</h2>
              {data.tasksByUser.length === 0 ? (
                <p className="text-sm" style={{ color: '#94a3b8' }}>No assigned tasks.</p>
              ) : (
                <ul className="space-y-3">
                  {data.tasksByUser.filter(r => r.user).sort((a, b) => b.count - a.count).map(row => (
                    <li key={row.user.id} className="flex items-center gap-3 rounded-xl p-3"
                      style={{ background: '#f8fafc' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}>
                        {row.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>{row.user.name}</p>
                        <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{row.user.email}</p>
                      </div>
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}>
                        {row.count}
                      </div>
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

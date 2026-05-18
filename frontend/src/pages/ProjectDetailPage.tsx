import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LayoutDashboard, Plus, ChevronRight, Users, CheckSquare, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import TaskList from '../components/TaskList'
import TaskModal from '../components/TaskModal'
import MembersPanel from '../components/MembersPanel'
import type { ProjectDetail } from '../components/TaskModal'

function DetailSkeleton() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="skeleton h-28 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    </Layout>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)

  async function fetchProject() {
    if (!id) return
    try {
      const r = await api.get<ProjectDetail>(`/api/projects/${id}`)
      setProject(r.data)
      setError(null)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to load project'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProject() }, [id]) // eslint-disable-line

  if (loading) return <DetailSkeleton />

  if (error || !project) return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <AlertCircle size={24} style={{ color: '#f87171' }} />
        </div>
        <p className="font-semibold mb-2" style={{ color: '#f87171' }}>{error ?? 'Project not found'}</p>
        <Link to="/projects" className="text-sm font-medium transition-colors hover:text-indigo-300"
          style={{ color: '#818cf8' }}>
          ← Back to projects
        </Link>
      </div>
    </Layout>
  )

  const userRole = project.role
  const currentUserId = user?.id ?? ''
  const doneTasks = project.tasks.filter(t => t.status === 'DONE').length
  const progressPct = project.tasks.length > 0 ? Math.round((doneTasks / project.tasks.length) * 100) : 0

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ───────────────────────────── */}
        <div className="rounded-2xl px-7 py-6 fade-up relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d1a35 0%, #111f3e 50%, #0f1c30 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
          {/* Decorative orb */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{ background: '#6366f1', filter: 'blur(40px)' }} />

          <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-[11px] mb-3" style={{ color: '#3d5a7a' }}>
                <Link to="/projects" className="transition-colors hover:text-indigo-400">Projects</Link>
                <ChevronRight size={11} />
                <span style={{ color: '#818cf8' }}>{project.name}</span>
              </div>

              <h1 className="text-xl font-bold tracking-tight mb-1" style={{ color: '#f0f4ff' }}>
                {project.name}
              </h1>
              {project.description && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>
              )}

              {/* Progress */}
              {project.tasks.length > 0 && (
                <div className="mt-4 max-w-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ color: '#818cf8' }}>{progressPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <div className="h-full rounded-full progress-bar"
                      style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#6366f1,#3b82f6)' }} />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {doneTasks} of {project.tasks.length} tasks completed
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/projects/${project.id}/dashboard`}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)' }}
              >
                <LayoutDashboard size={13} />
                Dashboard
              </Link>
              {userRole === 'ADMIN' && (
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white"
                >
                  <Plus size={13} />
                  New task
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Content grid ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Tasks panel */}
          <section
            className="lg:col-span-2 rounded-2xl p-5 fade-up stagger-1"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <CheckSquare size={15} style={{ color: '#6366f1' }} />
                <h2 className="text-sm font-bold" style={{ color: '#e0e7ff' }}>Tasks</h2>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                {project.tasks.length}
              </span>
            </div>
            <TaskList
              tasks={project.tasks}
              members={project.members}
              projectId={project.id}
              userRole={userRole}
              currentUserId={currentUserId}
              onTaskUpdated={fetchProject}
            />
          </section>

          {/* Members panel */}
          <section
            className="rounded-2xl p-5 fade-up stagger-2"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Users size={15} style={{ color: '#6366f1' }} />
                <h2 className="text-sm font-bold" style={{ color: '#e0e7ff' }}>Members</h2>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                {project.members.length}
              </span>
            </div>
            <MembersPanel
              projectId={project.id}
              members={project.members}
              userRole={userRole}
              currentUserId={currentUserId}
              onMembersUpdated={fetchProject}
            />
          </section>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          projectId={project.id}
          members={project.members}
          onClose={() => setShowTaskModal(false)}
          onSaved={() => { setShowTaskModal(false); fetchProject() }}
        />
      )}
    </Layout>
  )
}

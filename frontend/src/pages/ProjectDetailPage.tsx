import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import TaskList from '../components/TaskList'
import TaskModal from '../components/TaskModal'
import MembersPanel from '../components/MembersPanel'
import type { ProjectDetail } from '../components/TaskModal'

const darkCard = { background: 'linear-gradient(135deg, #1e1b4b 0%, #1e2a4a 100%)', border: '1px solid #2d3561' }
const glowBadge = { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }

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
      setProject(r.data); setError(null)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to load project'
      setError(msg); toast.error(msg)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchProject() }, [id]) // eslint-disable-line

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
      </div>
    </Layout>
  )

  if (error || !project) return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="font-medium mb-4" style={{ color: '#e11d48' }}>{error ?? 'Project not found'}</p>
        <Link to="/projects" className="text-sm" style={{ color: '#818cf8' }}>← Back to projects</Link>
      </div>
    </Layout>
  )

  const userRole = project.role
  const currentUserId = user?.id ?? ''

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl px-7 py-6 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #1e3a5f 100%)' }}>
          <div>
            <div className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: '#818cf8' }}>
              <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
              <span>/</span>
              <span style={{ color: '#c7d2fe' }}>{project.name}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#818cf8' }}>Project</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
            {project.description && <p className="text-sm mt-0.5" style={{ color: '#a5b4fc' }}>{project.description}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to={`/projects/${project.id}/dashboard`}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#c7d2fe', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </Link>
            {userRole === 'ADMIN' && (
              <button onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New task
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section className="lg:col-span-2 rounded-2xl p-5 shadow-sm" style={darkCard}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Tasks</h2>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={glowBadge}>
                {project.tasks.length}
              </span>
            </div>
            <TaskList tasks={project.tasks} members={project.members} projectId={project.id}
              userRole={userRole} currentUserId={currentUserId} onTaskUpdated={fetchProject} />
          </section>

          <section className="rounded-2xl p-5 shadow-sm" style={darkCard}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Members</h2>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={glowBadge}>
                {project.members.length}
              </span>
            </div>
            <MembersPanel projectId={project.id} members={project.members}
              userRole={userRole} currentUserId={currentUserId} onMembersUpdated={fetchProject} />
          </section>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal projectId={project.id} members={project.members}
          onClose={() => setShowTaskModal(false)}
          onSaved={() => { setShowTaskModal(false); fetchProject() }} />
      )}
    </Layout>
  )
}

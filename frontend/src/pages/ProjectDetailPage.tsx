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

  const Spinner = () => (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    </Layout>
  )

  if (loading) return <Spinner />
  if (error || !project) return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <p className="text-rose-600 font-medium mb-4">{error ?? 'Project not found'}</p>
        <Link to="/projects" className="text-sm text-violet-600 hover:text-violet-700">← Back to projects</Link>
      </div>
    </Layout>
  )

  const userRole = project.role
  const currentUserId = user?.id ?? ''

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-2">
              <Link to="/projects" className="hover:text-violet-600 transition-colors">Projects</Link>
              <span>/</span>
              <span className="text-stone-600 font-medium">{project.name}</span>
            </div>
            <h1 className="text-xl font-bold text-stone-900">{project.name}</h1>
            {project.description && <p className="text-sm text-stone-500 mt-1">{project.description}</p>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/projects/${project.id}/dashboard`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </Link>
            {userRole === 'ADMIN' && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
              >
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
          <section className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-stone-800">Tasks</h2>
              <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-2 py-0.5">{project.tasks.length}</span>
            </div>
            <TaskList
              tasks={project.tasks} members={project.members} projectId={project.id}
              userRole={userRole} currentUserId={currentUserId} onTaskUpdated={fetchProject}
            />
          </section>

          <section className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-stone-800">Members</h2>
              <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-2 py-0.5">{project.members.length}</span>
            </div>
            <MembersPanel
              projectId={project.id} members={project.members}
              userRole={userRole} currentUserId={currentUserId} onMembersUpdated={fetchProject}
            />
          </section>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          projectId={project.id} members={project.members}
          onClose={() => setShowTaskModal(false)}
          onSaved={() => { setShowTaskModal(false); fetchProject() }}
        />
      )}
    </Layout>
  )
}

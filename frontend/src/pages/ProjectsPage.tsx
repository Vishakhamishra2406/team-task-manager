import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Layout from '../components/Layout'
import CreateProjectModal from '../components/CreateProjectModal'

interface Project {
  id: string; name: string; description?: string
  role: 'ADMIN' | 'MEMBER'
  _count: { members: number; tasks: number }
}

const roleColors: Record<string, string> = {
  ADMIN:  'bg-violet-100 text-violet-700',
  MEMBER: 'bg-stone-100 text-stone-600',
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function load() {
    try {
      const r = await api.get<Project[]>('/api/projects')
      setProjects(r.data)
    } catch { toast.error('Failed to load projects') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Projects</h1>
            <p className="text-sm text-stone-500 mt-0.5">Your workspaces</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New project
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-36 rounded-2xl bg-stone-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-stone-800 mb-1">No projects yet</h2>
            <p className="text-sm text-stone-500 mb-5">Create your first project to get started.</p>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              Create project
            </button>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="group text-left bg-white rounded-2xl border border-stone-200 p-5 hover:border-violet-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-stone-900 line-clamp-2 group-hover:text-violet-700 transition-colors">
                    {p.name}
                  </h2>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${roleColors[p.role]}`}>
                    {p.role === 'ADMIN' ? 'Admin' : 'Member'}
                  </span>
                </div>
                {p.description && (
                  <p className="text-xs text-stone-500 line-clamp-2 mb-3">{p.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-stone-400 mt-auto pt-2 border-t border-stone-50">
                  <span>{p._count.members} {p._count.members === 1 ? 'member' : 'members'}</span>
                  <span>·</span>
                  <span>{p._count.tasks} {p._count.tasks === 1 ? 'task' : 'tasks'}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreated={load} />}
    </Layout>
  )
}

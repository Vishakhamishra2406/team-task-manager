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

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function load() {
    try { const r = await api.get<Project[]>('/api/projects'); setProjects(r.data) }
    catch { toast.error('Failed to load projects') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between rounded-2xl px-7 py-6 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #1e3a5f 100%)' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#818cf8' }}>Workspace</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
            <p className="text-sm mt-0.5" style={{ color: '#a5b4fc' }}>Manage and track your team's work</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New project
          </button>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: '#e2e8f0' }} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1e2a4a 100%)', border: '1px solid #2d3561' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <svg className="w-8 h-8" style={{ color: '#818cf8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <h2 className="text-base font-bold mb-1 text-white">No projects yet</h2>
            <p className="text-sm mb-6" style={{ color: '#a5b4fc' }}>Create your first project to get started.</p>
            <button onClick={() => setShowModal(true)}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}>
              Create project
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <button key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                className="group text-left rounded-2xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1e2a4a 100%)', border: '1px solid #2d3561' }}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="text-sm font-bold line-clamp-2 text-white group-hover:text-indigo-300 transition-colors">
                    {p.name}
                  </h2>
                  <span className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold"
                    style={p.role === 'ADMIN'
                      ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
                      : { background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {p.role === 'ADMIN' ? 'Admin' : 'Member'}
                  </span>
                </div>
                {p.description && (
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: '#a5b4fc' }}>{p.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs pt-3 mt-auto"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: '#6366f1' }}>
                  <span>{p._count.members} {p._count.members === 1 ? 'member' : 'members'}</span>
                  <span style={{ color: '#2d3561' }}>·</span>
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

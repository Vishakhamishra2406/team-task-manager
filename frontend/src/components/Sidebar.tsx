import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

interface Project { id: string; name: string; role: 'ADMIN' | 'MEMBER' }

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams<{ id?: string }>()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    api.get<Project[]>('/api/projects')
      .then(r => setProjects(r.data))
      .catch(() => {})
  }, [])

  const activeId = params.id

  return (
    <aside className="flex flex-col w-56 shrink-0 h-screen bg-white border-r border-stone-200">
      {/* Logo */}
      <div className="flex items-center px-4 h-14 border-b border-stone-100">
        <img src="/logo.png" alt="Taskly" className="h-8 w-auto object-contain" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <Link
          to="/projects"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            location.pathname === '/projects'
              ? 'bg-violet-50 text-violet-700'
              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
          All Projects
        </Link>

        {projects.length > 0 && (
          <div className="pt-3 pb-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
              Recent
            </p>
            {projects.slice(0, 6).map(p => {
              const isActive = p.id === activeId
              const isDash = location.pathname === `/projects/${p.id}/dashboard`
              return (
                <div key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      isActive && !isDash
                        ? 'bg-violet-50 text-violet-700 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-violet-500' : 'bg-stone-300'}`} />
                    <span className="truncate">{p.name}</span>
                  </Link>
                  {isActive && (
                    <Link
                      to={`/projects/${p.id}/dashboard`}
                      className={`flex items-center gap-2 rounded-lg ml-5 px-3 py-1 text-xs transition-colors ${
                        isDash
                          ? 'text-violet-700 font-medium'
                          : 'text-stone-400 hover:text-stone-700'
                      }`}
                    >
                      ↗ Dashboard
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-stone-100 p-3">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1">
            <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-stone-800 truncate">{user.name}</p>
              <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}

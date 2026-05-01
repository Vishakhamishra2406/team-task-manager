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
    api.get<Project[]>('/api/projects').then(r => setProjects(r.data)).catch(() => {})
  }, [])

  const activeId = params.id

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen border-r"
      style={{ background: '#1a1f2e', borderColor: '#252b3b' }}>

      {/* Logo */}
      <div className="flex items-center px-5 h-16 border-b" style={{ borderColor: '#252b3b' }}>
        <img src="/logo.png" alt="Taskly" className="h-9 w-auto object-contain" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
        <Link
          to="/projects"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
          style={location.pathname === '/projects'
            ? { background: 'linear-gradient(135deg,#312e81,#1e3a5f)', color: '#fff' }
            : { color: '#94a3b8' }}
          onMouseEnter={e => { if (location.pathname !== '/projects') e.currentTarget.style.background = '#252b3b'; e.currentTarget.style.color = '#e2e8f0' }}
          onMouseLeave={e => { if (location.pathname !== '/projects') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
          All Projects
        </Link>

        {projects.length > 0 && (
          <div className="pt-5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>
              Recent
            </p>
            {projects.slice(0, 6).map(p => {
              const isActive = p.id === activeId
              const isDash = location.pathname === `/projects/${p.id}/dashboard`
              return (
                <div key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all"
                    style={isActive && !isDash
                      ? { background: 'linear-gradient(135deg,#312e81,#1e3a5f)', color: '#fff', fontWeight: 500 }
                      : { color: '#94a3b8' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: isActive ? '#818cf8' : '#334155' }} />
                    <span className="truncate">{p.name}</span>
                    {p.role === 'ADMIN' && (
                      <span className="ml-auto text-[10px] shrink-0" style={{ color: '#6366f1' }}>Admin</span>
                    )}
                  </Link>
                  {isActive && (
                    <Link
                      to={`/projects/${p.id}/dashboard`}
                      className="flex items-center gap-2 rounded-xl ml-5 px-3 py-1.5 text-xs transition-all"
                      style={isDash
                        ? { color: '#818cf8', fontWeight: 500 }
                        : { color: '#475569' }}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: '#252b3b' }}>
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1" style={{ background: '#252b3b' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', color: '#fff' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#e2e8f0' }}>{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: '#475569' }}>{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all"
          style={{ color: '#475569' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#252b3b'; e.currentTarget.style.color = '#94a3b8' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569' }}
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

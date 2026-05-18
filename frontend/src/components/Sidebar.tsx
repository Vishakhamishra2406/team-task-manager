import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Folders, FolderOpen, LayoutDashboard, LogOut,
  ChevronRight, ShieldCheck, Menu, X,
} from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

interface Project { id: string; name: string; role: 'ADMIN' | 'MEMBER' }

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams<{ id?: string }>()
  const [projects, setProjects] = useState<Project[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    api.get<Project[]>('/api/projects').then(r => setProjects(r.data)).catch(() => {})
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const activeId = params.id
  const isProjectsRoot = location.pathname === '/projects'

  const content = (
    <aside
      className="flex flex-col w-64 shrink-0 h-screen"
      style={{
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* ── Logo ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 h-16 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <img
          src="/logo-dark.svg"
          alt="Taskly"
          className="h-8 w-auto object-contain"
          style={{ maxWidth: '120px' }}
        />
        <button
          className="lg:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: '#3d5a7a' }}
          onClick={() => setMobileOpen(false)}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">

        {/* All Projects */}
        <Link
          to="/projects"
          className="nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium group"
          style={isProjectsRoot
            ? { background: 'rgba(99,102,241,0.15)', color: '#c7d2fe', borderLeft: '2px solid #6366f1' }
            : { color: 'var(--text-muted)', borderLeft: '2px solid transparent' }}
        >
          <Folders size={15} className="shrink-0"
            style={{ color: isProjectsRoot ? '#818cf8' : 'var(--text-muted)' }} />
          <span>All Projects</span>
          {isProjectsRoot && <ChevronRight size={13} className="ml-auto" style={{ color: '#6366f1' }} />}
        </Link>

        {/* Recent projects */}
        {projects.length > 0 && (
          <div className="pt-5">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: '#1e3352' }}>
              Recent
            </p>
            {projects.slice(0, 7).map(p => {
              const isActive = p.id === activeId
              const isDash = location.pathname === `/projects/${p.id}/dashboard`
              return (
                <div key={p.id} className="mb-0.5">
                  <Link
                    to={`/projects/${p.id}`}
                    className="nav-link flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm group"
                    style={isActive && !isDash
                      ? { background: 'rgba(99,102,241,0.12)', color: '#c7d2fe', fontWeight: 500, borderLeft: '2px solid #6366f1' }
                      : { color: '#3d5a7a', borderLeft: '2px solid transparent' }}
                  >
                    <FolderOpen size={13} className="shrink-0"
                      style={{ color: isActive && !isDash ? '#818cf8' : '#1e3352' }} />
                    <span className="truncate flex-1 text-xs">{p.name}</span>
                    {p.role === 'ADMIN' && (
                      <ShieldCheck size={11} className="shrink-0" style={{ color: '#4f46e5' }} />
                    )}
                  </Link>

                  {isActive && (
                    <Link
                      to={`/projects/${p.id}/dashboard`}
                      className="nav-link flex items-center gap-2 rounded-xl ml-5 px-3 py-1.5 text-xs mt-0.5"
                      style={isDash
                        ? { color: '#818cf8', fontWeight: 500, background: 'rgba(99,102,241,0.08)' }
                        : { color: '#1e3352' }}
                    >
                      <LayoutDashboard size={11} />
                      Dashboard
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </nav>

      {/* ── User footer ──────────────────────────── */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {user && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}
          >
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate" style={{ color: '#c7d2fe' }}>{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: '#1e3352' }}>{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="nav-link flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium group"
          style={{ color: '#1e3352' }}
        >
          <LogOut size={13} className="group-hover:text-red-400 transition-colors" />
          <span className="group-hover:text-red-400 transition-colors">Sign out</span>
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl shadow-xl"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#8ba3c0' }}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={17} />
      </button>

      {/* Desktop */}
      <div className="hidden lg:block shrink-0">{content}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 scale-in">{content}</div>
        </div>
      )}
    </>
  )
}

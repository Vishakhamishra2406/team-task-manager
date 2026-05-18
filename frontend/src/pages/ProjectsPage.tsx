import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Folders, Users, CheckSquare, Search, ShieldCheck, FolderOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Layout from '../components/Layout'
import CreateProjectModal from '../components/CreateProjectModal'
import { getAvatarGradient } from '../lib/utils'
import { PageTitle, FadeUpText } from '../components/AnimatedText'

interface Project {
  id: string
  name: string
  description?: string
  role: 'ADMIN' | 'MEMBER'
  _count: { members: number; tasks: number }
}

const EASE = [0.16, 1, 0.3, 1] as const

function ProjectSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: EASE }}
      className="rounded-2xl p-5 space-y-3"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex justify-between">
        <div className="skeleton h-4 w-32 rounded-lg" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-2/3 rounded-lg" />
      <div className="skeleton h-px w-full rounded" style={{ marginTop: '12px' }} />
      <div className="flex gap-3">
        <div className="skeleton h-3 w-16 rounded-lg" />
        <div className="skeleton h-3 w-16 rounded-lg" />
      </div>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    try {
      const r = await api.get<Project[]>('/api/projects')
      setProjects(r.data)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const adminCount = projects.filter(p => p.role === 'ADMIN').length
  const totalTasks = projects.reduce((s, p) => s + p._count.tasks, 0)

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-7">

        {/* ── Page header ──────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <PageTitle
            eyebrow="Workspace"
            title="Projects"
            subtitle="Manage and track your team's work"
          />
          <motion.button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.2, ease: EASE }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={15} />
            New project
          </motion.button>
        </div>

        {/* Quick stats */}
        <AnimatePresence>
          {!loading && projects.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25, ease: EASE }}
            >
              {[
                { icon: <Folders size={13} />, label: `${projects.length} project${projects.length !== 1 ? 's' : ''}`, color: 'var(--brand-400)' },
                { icon: <ShieldCheck size={13} />, label: `${adminCount} admin`, color: '#a78bfa' },
                { icon: <CheckSquare size={13} />, label: `${totalTasks} total tasks`, color: 'var(--info-text)' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: s.color }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.07, ease: EASE }}
                >
                  {s.icon}
                  {s.label}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search bar ───────────────────────── */}
        <AnimatePresence>
          {!loading && projects.length > 0 && (
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3, ease: EASE }}
            >
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-disabled)' }}
              />
              <input
                type="text"
                placeholder="Search projects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-dark w-full max-w-sm rounded-xl pl-9 pr-4 py-2.5 text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Skeleton ─────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <ProjectSkeleton key={i} index={i} />)}
          </div>
        )}

        {/* ── Empty state ──────────────────────── */}
        <AnimatePresence>
          {!loading && projects.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-28 text-center rounded-2xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FolderOpen size={28} style={{ color: 'var(--brand-500)' }} />
              </motion.div>
              <FadeUpText as="h2" className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }} delay={0.1}>
                No projects yet
              </FadeUpText>
              <motion.p
                className="text-sm mb-7 max-w-xs"
                style={{ color: 'var(--text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Create your first project to start organizing tasks and collaborating with your team.
              </motion.p>
              <motion.button
                onClick={() => setShowModal(true)}
                className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Plus size={15} />
                Create your first project
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── No search results ────────────────── */}
        <AnimatePresence>
          {!loading && projects.length > 0 && filtered.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-16 text-center rounded-2xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <Search size={24} className="mb-3" style={{ color: 'var(--text-disabled)' }} />
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                No results for "{search}"
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Try a different search term</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Project grid ─────────────────────── */}
        <AnimatePresence>
          {!loading && filtered.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
            >
              {filtered.map((p) => {
                const completionPct = p._count.tasks > 0 ? Math.round(Math.random() * 80 + 10) : 0
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="card-interactive group text-left rounded-2xl p-5"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
                    variants={{
                      hidden: { opacity: 0, y: 16, scale: 0.97 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE } },
                    }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Card top */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-white"
                          style={{ background: getAvatarGradient(p.name) }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <h2
                          className="text-sm font-semibold line-clamp-1 transition-colors group-hover:text-indigo-300"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {p.name}
                        </h2>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={p.role === 'ADMIN'
                          ? { background: 'rgba(99,102,241,0.15)', color: 'var(--brand-400)', border: '1px solid rgba(99,102,241,0.25)' }
                          : { background: 'rgba(100,116,139,0.1)', color: 'var(--text-tertiary)', border: '1px solid rgba(100,116,139,0.2)' }}
                      >
                        {p.role === 'ADMIN' ? 'Admin' : 'Member'}
                      </span>
                    </div>

                    {p.description && (
                      <p
                        className="text-xs line-clamp-2 mb-3 leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {p.description}
                      </p>
                    )}

                    {/* Progress bar */}
                    {p._count.tasks > 0 && (
                      <div className="mb-3">
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg,var(--brand-500),var(--accent-400))' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPct}%` }}
                            transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div
                      className="flex items-center gap-3 pt-3"
                      style={{ borderTop: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <Users size={11} />
                        <span>{p._count.members}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <CheckSquare size={11} />
                        <span>{p._count.tasks} task{p._count.tasks !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="ml-auto">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ color: 'var(--border-strong)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreated={load} />
      )}
    </Layout>
  )
}

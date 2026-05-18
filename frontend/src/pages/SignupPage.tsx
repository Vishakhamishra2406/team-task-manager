import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Users, BarChart3, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { extractError } from '../lib/utils'
import Spinner from '../components/Spinner'
import { BlurReveal } from '../components/AnimatedText'

const perks = [
  { icon: <Users size={15} />, title: 'Team collaboration', desc: 'Invite unlimited team members' },
  { icon: <BarChart3 size={15} />, title: 'Visual analytics', desc: 'Track progress with dashboards' },
  { icon: <Shield size={15} />, title: 'Secure by default', desc: 'JWT auth, encrypted data' },
]

const EASE = [0.16, 1, 0.3, 1] as const

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signup(name, email, password)
      toast.success('Account created! Welcome aboard 🎉')
      navigate('/projects', { replace: true })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-canvas)' }}>

      {/* ── Left branding panel ─────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] auth-gradient flex-col justify-between p-12 relative overflow-hidden">
        <motion.div
          className="orb w-80 h-80"
          style={{ background: '#6366f1', top: '-80px', left: '-80px', opacity: 0.12 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="orb w-48 h-48"
          style={{ background: '#8b5cf6', bottom: '100px', right: '-30px', opacity: 0.08 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <img src="/logo-dark.svg" alt="Taskly" className="h-10 w-auto object-contain" />
        </motion.div>

        <div className="relative space-y-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            >
              <span className="block text-[2.6rem] font-bold leading-[1.15] tracking-tight text-white">
                Your team's
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
            >
              <span className="block text-[2.6rem] font-bold leading-[1.15] tracking-tight text-gradient">
                command center.
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
              className="text-base leading-relaxed mt-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              Create projects, assign tasks, track progress — all in one clean workspace.
            </motion.p>
          </div>

          {/* Perk cards */}
          <div className="grid grid-cols-2 gap-3">
            {perks.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.6 + i * 0.1, ease: EASE }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="rounded-xl p-3.5 cursor-default"
                style={{
                  background: 'rgba(99,102,241,0.07)',
                  border: '1px solid rgba(99,102,241,0.14)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center mb-2.5"
                  style={{ background: 'rgba(99,102,241,0.18)', color: 'var(--brand-400)' }}
                >
                  {p.icon}
                </div>
                <p className="text-xs font-semibold text-white mb-0.5">{p.title}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-disabled)' }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.1 }}
          className="relative text-xs"
          style={{ color: 'var(--text-disabled)' }}
        >
          © 2025 Taskly. All rights reserved.
        </motion.p>
      </div>

      {/* ── Right form panel ────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="w-full max-w-sm">

          <motion.div
            className="mb-8 lg:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <img src="/logo-dark.svg" alt="Taskly" className="h-9 w-auto object-contain" />
          </motion.div>

          <div className="mb-8">
            <BlurReveal as="h1" className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Create account
            </BlurReveal>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Already have one?{' '}
              <Link
                to="/login"
                className="font-semibold transition-colors hover:text-indigo-300"
                style={{ color: 'var(--brand-400)' }}
              >
                Sign in →
              </Link>
            </motion.p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: EASE }}
          >
            {[
              { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name', value: name, onChange: (v: string) => setName(v), placeholder: 'Alex Johnson' },
              { id: 'email', label: 'Email address', type: 'email', autoComplete: 'email', value: email, onChange: (v: string) => setEmail(v), placeholder: 'you@company.com' },
            ].map(field => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {field.label}
                </label>
                <input
                  id={field.id} type={field.type} autoComplete={field.autoComplete} required
                  value={field.value} onChange={e => field.onChange(e.target.value)} disabled={loading}
                  placeholder={field.placeholder}
                  className="input-dark w-full rounded-xl px-4 py-3 text-sm"
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password" type={showPw ? 'text' : 'password'} autoComplete="new-password" required
                  value={password} onChange={e => setPassword(e.target.value)} disabled={loading}
                  placeholder="Min. 6 characters"
                  className="input-dark w-full rounded-xl px-4 py-3 text-sm pr-11"
                />
                <button
                  type="button" tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onClick={() => setShowPw(v => !v)}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <motion.div
                      key={i}
                      className="h-1 flex-1 rounded-full"
                      animate={{
                        background: password.length >= i * 2
                          ? password.length < 4 ? '#ef4444' : password.length < 7 ? '#f59e0b' : '#10b981'
                          : 'var(--border-default)',
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, scale: 0.97, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
                style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                }}
              >
                <span className="mt-0.5 shrink-0">⚠</span>
                {error}
              </motion.div>
            )}

            <button
              type="submit" disabled={loading || !name || !email || !password}
              className="btn-primary w-full rounded-xl px-4 py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-2"
            >
              {loading ? <Spinner size="sm" color="#fff" /> : <>Get started <ArrowRight size={15} /></>}
            </button>

            <p className="text-center text-[11px]" style={{ color: 'var(--text-disabled)' }}>
              By signing up you agree to our{' '}
              <span style={{ color: 'var(--text-tertiary)' }}>Terms of Service</span> and{' '}
              <span style={{ color: 'var(--text-tertiary)' }}>Privacy Policy</span>
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  )
}

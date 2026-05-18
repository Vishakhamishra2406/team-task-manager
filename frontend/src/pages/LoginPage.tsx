import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { extractError } from '../lib/utils'
import Spinner from '../components/Spinner'
import {
  BlurReveal,
  GlowPulse,
} from '../components/AnimatedText'

const features = [
  'Organize projects and tasks in one place',
  'Collaborate with your team in real time',
  'Track progress with visual dashboards',
]

const EASE = [0.16, 1, 0.3, 1] as const

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
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
      await login(email, password)
      toast.success('Welcome back!')
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
        {/* Orbs */}
        <motion.div
          className="orb w-80 h-80"
          style={{ background: '#6366f1', top: '-80px', left: '-80px', opacity: 0.12 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="orb w-56 h-56"
          style={{ background: '#3b82f6', bottom: '80px', right: '-40px', opacity: 0.08 }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <motion.div
          className="orb w-32 h-32"
          style={{ background: '#8b5cf6', top: '40%', right: '20%', opacity: 0.08 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />

        {/* Logo */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <img src="/logo-dark.svg" alt="Taskly" className="h-10 w-auto object-contain" />
        </motion.div>

        {/* Hero text */}
        <div className="relative space-y-8">
          <div>
            {/* Main headline — split word reveal */}
            <div className="mb-4">
              {['Collaborate.', 'Organize.'].map((word, i) => (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.12, ease: EASE }}
                >
                  <span
                    className="block text-[2.6rem] font-bold leading-[1.15] tracking-tight text-white"
                  >
                    {word}
                  </span>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.44, ease: EASE }}
              >
                <span className="block text-[2.6rem] font-bold leading-[1.15] tracking-tight text-gradient">
                  Ship faster.
                </span>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
              className="text-base leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Manage your team's work in one place — tasks, projects, and progress at a glance.
            </motion.p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {features.map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.7 + i * 0.1, ease: EASE }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 size={15} style={{ color: 'var(--brand-500)', flexShrink: 0 }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f}</span>
              </motion.li>
            ))}
          </ul>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 1.05, ease: EASE }}
            className="flex items-center gap-3 pt-2"
          >
            <div className="flex -space-x-2">
              {['A', 'B', 'C', 'D'].map((l, i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.1 + i * 0.07, ease: EASE }}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    borderColor: '#0d1117',
                    background: ['#6366f1', '#3b82f6', '#8b5cf6', '#06b6d4'][i],
                  }}
                >
                  {l}
                </motion.div>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>
              Trusted by{' '}
              <GlowPulse color="var(--brand-400)">
                <span className="font-semibold">2,400+</span>
              </GlowPulse>{' '}
              teams worldwide
            </p>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.3 }}
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

          {/* Mobile logo */}
          <motion.div
            className="mb-8 lg:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <img src="/logo-dark.svg" alt="Taskly" className="h-9 w-auto object-contain" />
          </motion.div>

          {/* Form heading */}
          <div className="mb-8">
            <BlurReveal as="h1" className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Sign in
            </BlurReveal>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              No account?{' '}
              <Link
                to="/signup"
                className="font-semibold transition-colors hover:text-indigo-300"
                style={{ color: 'var(--brand-400)' }}
              >
                Create one free →
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
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Email address
              </label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={e => setEmail(e.target.value)} disabled={loading}
                placeholder="you@company.com"
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>

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
                  id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)} disabled={loading}
                  placeholder="••••••••"
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
              type="submit" disabled={loading || !email || !password}
              className="btn-primary w-full rounded-xl px-4 py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-2"
            >
              {loading ? <Spinner size="sm" color="#fff" /> : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  )
}

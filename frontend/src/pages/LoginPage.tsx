import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

interface ApiValidationError { msg: string; path: string }

function extractError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Something went wrong'
  const d = err.response?.data as { error?: string; errors?: ApiValidationError[] } | undefined
  if (!d) return 'Something went wrong'
  if (Array.isArray(d.errors) && d.errors.length > 0) return d.errors[0].msg
  return d.error ?? 'Something went wrong'
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-violet-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Taskly" className="h-10 w-auto object-contain" />
        </div>
        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Collaborate.<br />Organize.<br />Ship faster.
          </h2>
          <p className="text-violet-200 text-base">
            Manage your team's work in one place — tasks, projects, and progress at a glance.
          </p>
        </div>
        <p className="text-violet-300 text-sm">© 2025 Taskly</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-stone-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <img src="/logo.png" alt="Taskly" className="h-9 w-auto object-contain" />
          </div>

          <h1 className="text-2xl font-bold text-stone-900 mb-1">Sign in</h1>
          <p className="text-stone-500 text-sm mb-8">
            No account?{' '}
            <Link to="/signup" className="text-violet-600 hover:text-violet-700 font-medium">
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={e => setEmail(e.target.value)} disabled={loading}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                id="password" type="password" autoComplete="current-password" required
                value={password} onChange={e => setPassword(e.target.value)} disabled={loading}
                placeholder="••••••••"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 transition"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

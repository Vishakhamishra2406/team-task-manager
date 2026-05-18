import { useState } from 'react'
import type { FormEvent } from 'react'
import { X, FolderPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { extractError } from '../lib/utils'
import Spinner from './Spinner'

export default function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/api/projects', { name: name.trim(), description: description.trim() || undefined })
      toast.success('Project created!')
      onCreated()
      onClose()
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-labelledby="cp-title"
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 scale-in"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <FolderPlus size={16} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h2 id="cp-title" className="text-sm font-bold" style={{ color: '#f0f4ff' }}>
                New Project
              </h2>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Create a workspace for your team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e0e7ff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="pname"
              className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Project name <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              id="pname" type="text" required
              value={name} onChange={e => setName(e.target.value)}
              disabled={loading} placeholder="e.g. Website Redesign"
              className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="pdesc"
              className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Description{' '}
              <span className="normal-case font-normal" style={{ color: '#1e3352' }}>(optional)</span>
            </label>
            <textarea
              id="pdesc" rows={3}
              value={description} onChange={e => setDescription(e.target.value)}
              disabled={loading} placeholder="What's this project about?"
              className="input-dark w-full rounded-xl px-4 py-3 text-sm resize-none"
            />
          </div>

          {error && (
            <div role="alert"
              className="rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
              <span className="mt-0.5 shrink-0">⚠</span>
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button" onClick={onClose} disabled={loading}
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading || !name.trim()}
              className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? <Spinner size="sm" color="#fff" /> : <FolderPlus size={14} />}
              {loading ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import api from '../lib/api'

interface ApiValidationError { msg: string; path: string }
function extractError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Something went wrong'
  const d = err.response?.data as { error?: string; errors?: ApiValidationError[] } | undefined
  if (!d) return 'Something went wrong'
  if (Array.isArray(d.errors) && d.errors.length > 0) return d.errors[0].msg
  return d.error ?? 'Something went wrong'
}

export default function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/api/projects', { name, description: description || undefined })
      toast.success('Project created!')
      onCreated()
      onClose()
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white disabled:opacity-50 transition'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-labelledby="cp-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 id="cp-title" className="text-base font-bold text-stone-900">New Project</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="pname" className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
              Name <span className="text-rose-500">*</span>
            </label>
            <input id="pname" type="text" required value={name} onChange={e => setName(e.target.value)}
              disabled={loading} placeholder="e.g. Website Redesign" className={inputCls} />
          </div>
          <div>
            <label htmlFor="pdesc" className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
              Description <span className="text-stone-400 normal-case font-normal">(optional)</span>
            </label>
            <textarea id="pdesc" rows={3} value={description} onChange={e => setDescription(e.target.value)}
              disabled={loading} placeholder="What's this project about?" className={`${inputCls} resize-none`} />
          </div>

          {error && <div role="alert" className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

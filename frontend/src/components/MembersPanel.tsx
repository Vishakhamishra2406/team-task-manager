import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { ProjectMember } from './TaskModal'

interface ApiValidationError { msg: string; path: string }
function extractError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Something went wrong'
  const d = err.response?.data as { error?: string; errors?: ApiValidationError[] } | undefined
  if (!d) return 'Something went wrong'
  if (Array.isArray(d.errors) && d.errors.length > 0) return d.errors[0].msg
  return d.error ?? 'Something went wrong'
}

interface MembersPanelProps {
  projectId: string; members: ProjectMember[]
  userRole: 'ADMIN' | 'MEMBER'; currentUserId: string; onMembersUpdated: () => void
}

export default function MembersPanel({ projectId, members, userRole, currentUserId, onMembersUpdated }: MembersPanelProps) {
  const [email, setEmail] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleAdd(e: FormEvent) {
    e.preventDefault(); setAddError(null); setAddLoading(true)
    try {
      await api.post(`/api/projects/${projectId}/members`, { email: email.trim() })
      toast.success(`${email.trim()} added`); setEmail(''); onMembersUpdated()
    } catch (err) { setAddError(extractError(err)) }
    finally { setAddLoading(false) }
  }

  async function handleRemove(userId: string, name: string) {
    if (!confirm(`Remove ${name}?`)) return
    setRemovingId(userId)
    try { await api.delete(`/api/projects/${projectId}/members/${userId}`); toast.success(`${name} removed`); onMembersUpdated() }
    catch (err) { toast.error(extractError(err)) }
    finally { setRemovingId(null) }
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-1" role="list">
        {members.map(m => (
          <li key={m.id} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0">
                {m.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{m.user.name}</p>
                <p className="text-xs text-stone-400 truncate">{m.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${m.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-stone-100 text-stone-600'}`}>
                {m.role === 'ADMIN' ? 'Admin' : 'Member'}
              </span>
              {userRole === 'ADMIN' && m.user.id !== currentUserId && (
                <button
                  onClick={() => handleRemove(m.user.id, m.user.name)}
                  disabled={removingId === m.user.id}
                  className="text-stone-300 hover:text-rose-500 disabled:opacity-50 transition-colors"
                  aria-label={`Remove ${m.user.name}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {userRole === 'ADMIN' && (
        <form onSubmit={handleAdd} noValidate className="pt-3 border-t border-stone-100 space-y-2">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Add member</p>
          <div className="flex gap-2">
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              disabled={addLoading} placeholder="colleague@company.com"
              className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white disabled:opacity-50 transition"
            />
            <button type="submit" disabled={addLoading || !email.trim()}
              className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              {addLoading ? '…' : 'Add'}
            </button>
          </div>
          {addError && <p role="alert" className="text-xs text-rose-600">{addError}</p>}
        </form>
      )}
    </div>
  )
}

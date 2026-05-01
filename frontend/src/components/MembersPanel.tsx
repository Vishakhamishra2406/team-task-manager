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
    <div className="space-y-2">
      <ul className="space-y-1" role="list">
        {members.map(m => (
          <li key={m.id} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}>
                {m.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-white">{m.user.name}</p>
                <p className="text-xs truncate" style={{ color: '#6366f1' }}>{m.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-lg px-2 py-0.5 text-xs font-semibold"
                style={m.role === 'ADMIN'
                  ? { background: '#ede9fe', color: '#6d28d9' }
                  : { background: '#f1f5f9', color: '#475569' }}>
                {m.role === 'ADMIN' ? 'Admin' : 'Member'}
              </span>
              {userRole === 'ADMIN' && m.user.id !== currentUserId && (
                <button onClick={() => handleRemove(m.user.id, m.user.name)}
                  disabled={removingId === m.user.id}
                  className="transition-colors disabled:opacity-50"
                  style={{ color: '#cbd5e1' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#e11d48')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}>
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
        <form onSubmit={handleAdd} noValidate className="pt-3 space-y-2" style={{ borderTop: '1px solid #e2e8f0' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Add member</p>
          <div className="flex gap-2">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              disabled={addLoading} placeholder="colleague@company.com"
              className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none transition"
              style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }} />
            <button type="submit" disabled={addLoading || !email.trim()}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition"
              style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}>
              {addLoading ? '…' : 'Add'}
            </button>
          </div>
          {addError && <p className="text-xs" style={{ color: '#e11d48' }}>{addError}</p>}
        </form>
      )}
    </div>
  )
}

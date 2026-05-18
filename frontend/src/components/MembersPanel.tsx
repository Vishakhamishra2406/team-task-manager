import { useState } from 'react'
import type { FormEvent } from 'react'
import { UserPlus, X, ShieldCheck, User } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { extractError } from '../lib/utils'
import Avatar from './Avatar'
import Spinner from './Spinner'
import type { ProjectMember } from './TaskModal'

interface MembersPanelProps {
  projectId: string
  members: ProjectMember[]
  userRole: 'ADMIN' | 'MEMBER'
  currentUserId: string
  onMembersUpdated: () => void
}

export default function MembersPanel({
  projectId, members, userRole, currentUserId, onMembersUpdated,
}: MembersPanelProps) {
  const [email, setEmail] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setAddError(null)
    setAddLoading(true)
    try {
      await api.post(`/api/projects/${projectId}/members`, { email: email.trim() })
      toast.success(`${email.trim()} added to project`)
      setEmail('')
      onMembersUpdated()
    } catch (err) {
      setAddError(extractError(err))
    } finally {
      setAddLoading(false)
    }
  }

  async function handleRemove(userId: string, name: string) {
    if (!confirm(`Remove ${name} from this project?`)) return
    setRemovingId(userId)
    try {
      await api.delete(`/api/projects/${projectId}/members/${userId}`)
      toast.success(`${name} removed`)
      onMembersUpdated()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Member list */}
      <ul className="space-y-1.5" role="list">
        {members.map(m => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition-colors group"
            style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.08)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={m.user.name} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: '#e0e7ff' }}>
                  {m.user.name}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {m.user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1"
                style={m.role === 'ADMIN'
                  ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }
                  : { background: 'rgba(100,116,139,0.1)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }}
              >
                {m.role === 'ADMIN' ? <ShieldCheck size={9} /> : <User size={9} />}
                {m.role === 'ADMIN' ? 'Admin' : 'Member'}
              </span>

              {userRole === 'ADMIN' && m.user.id !== currentUserId && (
                <button
                  onClick={() => handleRemove(m.user.id, m.user.name)}
                  disabled={removingId === m.user.id}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.color = '#f87171' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                  aria-label={`Remove ${m.user.name}`}
                >
                  {removingId === m.user.id ? <Spinner size="sm" color="#f87171" /> : <X size={12} />}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Add member form (admin only) */}
      {userRole === 'ADMIN' && (
        <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}>
            <UserPlus size={10} />
            Add member
          </p>
          <form onSubmit={handleAdd} noValidate className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                disabled={addLoading}
                placeholder="colleague@company.com"
                className="input-dark flex-1 rounded-xl px-3 py-2.5 text-xs"
              />
              <button
                type="submit" disabled={addLoading || !email.trim()}
                className="btn-primary rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none shrink-0"
              >
                {addLoading ? <Spinner size="sm" color="#fff" /> : <UserPlus size={13} />}
                {addLoading ? '…' : 'Add'}
              </button>
            </div>
            {addError && (
              <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#f87171' }}>
                <span>⚠</span> {addError}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  )
}

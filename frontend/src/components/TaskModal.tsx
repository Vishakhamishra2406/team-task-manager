import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { X, ClipboardList, Calendar, User, Flag, Activity } from 'lucide-react'
import api from '../lib/api'
import { extractError } from '../lib/utils'
import Spinner from './Spinner'

export interface UserDTO { id: string; name: string; email: string }
export interface Task {
  id: string; title: string; description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string; projectId: string; assignedTo?: UserDTO; createdAt: string
}
export interface ProjectMember { id: string; role: 'ADMIN' | 'MEMBER'; user: UserDTO }
export interface ProjectDetail {
  id: string; name: string; description?: string; adminId: string
  admin: UserDTO; role: 'ADMIN' | 'MEMBER'; members: ProjectMember[]; tasks: Task[]
}

interface TaskModalProps {
  projectId: string
  members: ProjectMember[]
  task?: Task
  onClose: () => void
  onSaved: () => void
}

const statusOptions = [
  { value: 'TODO',        label: 'To Do',       color: '#64748b' },
  { value: 'IN_PROGRESS', label: 'In Progress',  color: '#f59e0b' },
  { value: 'DONE',        label: 'Done',         color: '#22c55e' },
]
const priorityOptions = [
  { value: 'LOW',    label: 'Low',    color: '#38bdf8', icon: '↓' },
  { value: 'MEDIUM', label: 'Medium', color: '#fbbf24', icon: '→' },
  { value: 'HIGH',   label: 'High',   color: '#f87171', icon: '↑' },
]

export default function TaskModal({ projectId, members, task, onClose, onSaved }: TaskModalProps) {
  const isEdit = Boolean(task)
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<Task['status']>(task?.status ?? 'TODO')
  const [priority, setPriority] = useState<Task['priority']>(task?.priority ?? 'MEDIUM')
  const [dueDate, setDueDate] = useState(() => task?.dueDate ? task.dueDate.slice(0, 10) : '')
  const [assignedToId, setAssignedToId] = useState(task?.assignedTo?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setStatus(task.status)
      setPriority(task.priority)
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
      setAssignedToId(task.assignedTo?.id ?? '')
    }
  }, [task])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status, priority,
      dueDate: dueDate || undefined,
      assignedToId: assignedToId || undefined,
    }
    try {
      if (isEdit && task) await api.put(`/api/tasks/${task.id}`, payload)
      else await api.post(`/api/projects/${projectId}/tasks`, payload)
      onSaved()
      onClose()
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const labelCls = 'block text-[11px] font-semibold uppercase tracking-widest mb-2'
  const labelStyle = { color: 'var(--text-muted)' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 fade-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-labelledby="tm-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl scale-in max-h-[92vh] overflow-y-auto"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <ClipboardList size={16} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h2 id="tm-title" className="text-sm font-bold" style={{ color: '#f0f4ff' }}>
                {isEdit ? 'Edit task' : 'New task'}
              </h2>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {isEdit ? 'Update task details' : 'Add a task to this project'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e0e7ff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="t-title" className={labelCls} style={labelStyle}>
              Title <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              id="t-title" type="text" required
              value={title} onChange={e => setTitle(e.target.value)}
              disabled={loading} placeholder="What needs to be done?"
              className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              autoFocus={!isEdit}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="t-desc" className={labelCls} style={labelStyle}>
              Description{' '}
              <span className="normal-case font-normal" style={{ color: '#1e3352' }}>(optional)</span>
            </label>
            <textarea
              id="t-desc" rows={3}
              value={description} onChange={e => setDescription(e.target.value)}
              disabled={loading} placeholder="Add context or details…"
              className="input-dark w-full rounded-xl px-4 py-3 text-sm resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="t-status" className={labelCls} style={labelStyle}>
                <span className="flex items-center gap-1.5"><Activity size={10} />Status</span>
              </label>
              <div className="relative">
                <select
                  id="t-status" value={status}
                  onChange={e => setStatus(e.target.value as Task['status'])}
                  disabled={loading}
                  className="input-dark w-full rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer"
                >
                  {statusOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-2 h-2 rounded-full"
                    style={{ background: statusOptions.find(o => o.value === status)?.color }} />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="t-priority" className={labelCls} style={labelStyle}>
                <span className="flex items-center gap-1.5"><Flag size={10} />Priority</span>
              </label>
              <div className="relative">
                <select
                  id="t-priority" value={priority}
                  onChange={e => setPriority(e.target.value as Task['priority'])}
                  disabled={loading}
                  className="input-dark w-full rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer"
                >
                  {priorityOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-bold"
                  style={{ color: priorityOptions.find(o => o.value === priority)?.color }}>
                  {priorityOptions.find(o => o.value === priority)?.icon}
                </div>
              </div>
            </div>
          </div>

          {/* Due date + Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="t-due" className={labelCls} style={labelStyle}>
                <span className="flex items-center gap-1.5"><Calendar size={10} />Due date</span>
              </label>
              <input
                id="t-due" type="date"
                value={dueDate} onChange={e => setDueDate(e.target.value)}
                disabled={loading}
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="t-assign" className={labelCls} style={labelStyle}>
                <span className="flex items-center gap-1.5"><User size={10} />Assign to</span>
              </label>
              <select
                id="t-assign" value={assignedToId}
                onChange={e => setAssignedToId(e.target.value)}
                disabled={loading}
                className="input-dark w-full rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div role="alert"
              className="rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
              <span className="mt-0.5 shrink-0">⚠</span>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-1">
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
              type="submit" disabled={loading || !title.trim()}
              className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? <Spinner size="sm" color="#fff" /> : <ClipboardList size={14} />}
              {loading
                ? (isEdit ? 'Saving…' : 'Creating…')
                : (isEdit ? 'Save changes' : 'Create task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

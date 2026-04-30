import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import api from '../lib/api'

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

interface ApiValidationError { msg: string; path: string }
function extractError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Something went wrong'
  const d = err.response?.data as { error?: string; errors?: ApiValidationError[] } | undefined
  if (!d) return 'Something went wrong'
  if (Array.isArray(d.errors) && d.errors.length > 0) return d.errors[0].msg
  return d.error ?? 'Something went wrong'
}

interface TaskModalProps {
  projectId: string; members: ProjectMember[]
  task?: Task; onClose: () => void; onSaved: () => void
}

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
      setTitle(task.title); setDescription(task.description ?? '')
      setStatus(task.status); setPriority(task.priority)
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
      setAssignedToId(task.assignedTo?.id ?? '')
    }
  }, [task])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null); setLoading(true)
    const payload = {
      title: title.trim(), description: description.trim() || undefined,
      status, priority, dueDate: dueDate || undefined,
      assignedToId: assignedToId || undefined,
    }
    try {
      if (isEdit && task) await api.put(`/api/tasks/${task.id}`, payload)
      else await api.post(`/api/projects/${projectId}/tasks`, payload)
      onSaved(); onClose()
    } catch (err) { setError(extractError(err)) }
    finally { setLoading(false) }
  }

  const inputCls = 'w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white disabled:opacity-50 transition'
  const labelCls = 'block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-labelledby="tm-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 id="tm-title" className="text-base font-bold text-stone-900">
            {isEdit ? 'Edit task' : 'New task'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="t-title" className={labelCls}>Title <span className="text-rose-500">*</span></label>
            <input id="t-title" type="text" required value={title} onChange={e => setTitle(e.target.value)}
              disabled={loading} placeholder="What needs to be done?" className={inputCls} />
          </div>
          <div>
            <label htmlFor="t-desc" className={labelCls}>Description <span className="text-stone-400 normal-case font-normal">(optional)</span></label>
            <textarea id="t-desc" rows={3} value={description} onChange={e => setDescription(e.target.value)}
              disabled={loading} placeholder="Add context or details…" className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="t-status" className={labelCls}>Status</label>
              <select id="t-status" value={status} onChange={e => setStatus(e.target.value as Task['status'])}
                disabled={loading} className={inputCls}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label htmlFor="t-priority" className={labelCls}>Priority</label>
              <select id="t-priority" value={priority} onChange={e => setPriority(e.target.value as Task['priority'])}
                disabled={loading} className={inputCls}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="t-due" className={labelCls}>Due date <span className="text-stone-400 normal-case font-normal">(opt.)</span></label>
              <input id="t-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                disabled={loading} className={inputCls} />
            </div>
            <div>
              <label htmlFor="t-assign" className={labelCls}>Assign to <span className="text-stone-400 normal-case font-normal">(opt.)</span></label>
              <select id="t-assign" value={assignedToId} onChange={e => setAssignedToId(e.target.value)}
                disabled={loading} className={inputCls}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <div role="alert" className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim()}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              {loading ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

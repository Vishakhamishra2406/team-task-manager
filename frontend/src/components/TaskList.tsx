import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Badge from './Badge'
import TaskModal from './TaskModal'
import type { Task, ProjectMember } from './TaskModal'

interface ApiValidationError { msg: string; path: string }
function extractError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Something went wrong'
  const d = err.response?.data as { error?: string; errors?: ApiValidationError[] } | undefined
  if (!d) return 'Something went wrong'
  if (Array.isArray(d.errors) && d.errors.length > 0) return d.errors[0].msg
  return d.error ?? 'Something went wrong'
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

interface TaskListProps {
  tasks: Task[]; members: ProjectMember[]; projectId: string
  userRole: 'ADMIN' | 'MEMBER'; currentUserId: string; onTaskUpdated: () => void
}

export default function TaskList({ tasks, members, projectId, userRole, currentUserId, onTaskUpdated }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return
    setDeletingId(id)
    try { await api.delete(`/api/tasks/${id}`); toast.success('Task deleted'); onTaskUpdated() }
    catch (err) { toast.error(extractError(err)) }
    finally { setDeletingId(null) }
  }

  async function handleStatusChange(id: string, status: Task['status']) {
    setUpdatingId(id)
    try { await api.put(`/api/tasks/${id}`, { status }); onTaskUpdated() }
    catch (err) { toast.error(extractError(err)) }
    finally { setUpdatingId(null) }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-stone-600">No tasks yet</p>
        <p className="text-xs text-stone-400 mt-0.5">Add a task to get started</p>
      </div>
    )
  }

  return (
    <>
      <ul className="space-y-2" role="list">
        {tasks.map(task => {
          const isOwn = task.assignedTo?.id === currentUserId
          const isDeleting = deletingId === task.id
          const isUpdating = updatingId === task.id

          return (
            <li key={task.id} className="group rounded-xl border border-stone-100 bg-stone-50 hover:bg-white hover:border-stone-200 hover:shadow-sm p-4 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <Badge type="status" value={task.status} />
                    <Badge type="priority" value={task.priority} />
                    {task.dueDate && (
                      <span className="text-xs text-stone-400">· {fmtDate(task.dueDate)}</span>
                    )}
                    {task.assignedTo && (
                      <span className="text-xs text-stone-400">· {task.assignedTo.name}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {userRole === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => setEditingTask(task)} disabled={isDeleting}
                        className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)} disabled={isDeleting}
                        className="rounded-lg border border-rose-100 px-2.5 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                      >
                        {isDeleting ? '…' : 'Delete'}
                      </button>
                    </>
                  )}
                  {userRole === 'MEMBER' && isOwn && (
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task.id, e.target.value as Task['status'])}
                      disabled={isUpdating}
                      aria-label={`Status for ${task.title}`}
                      className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {editingTask && (
        <TaskModal
          projectId={projectId} members={members} task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={() => { setEditingTask(null); onTaskUpdated() }}
        />
      )}
    </>
  )
}

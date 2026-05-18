import { useState } from 'react'
import { Pencil, Trash2, Calendar, AlertCircle, CheckCircle2, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { extractError, fmtDate, isOverdue } from '../lib/utils'
import Badge from './Badge'
import Avatar from './Avatar'
import Spinner from './Spinner'
import TaskModal from './TaskModal'
import type { Task, ProjectMember } from './TaskModal'

interface TaskListProps {
  tasks: Task[]
  members: ProjectMember[]
  projectId: string
  userRole: 'ADMIN' | 'MEMBER'
  currentUserId: string
  onTaskUpdated: () => void
}

const statusCycle: Record<Task['status'], Task['status']> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
}

export default function TaskList({
  tasks, members, projectId, userRole, currentUserId, onTaskUpdated,
}: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | Task['status']>('ALL')

  async function handleDelete(id: string) {
    if (!confirm('Delete this task? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await api.delete(`/api/tasks/${id}`)
      toast.success('Task deleted')
      onTaskUpdated()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleStatusChange(id: string, status: Task['status']) {
    setUpdatingId(id)
    try {
      await api.put(`/api/tasks/${id}`, { status })
      onTaskUpdated()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)

  const counts = {
    ALL: tasks.length,
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter(t => t.status === 'DONE').length,
  }

  const filterTabs: { key: 'ALL' | Task['status']; label: string; color: string }[] = [
    { key: 'ALL',        label: 'All',         color: '#818cf8' },
    { key: 'TODO',       label: 'To Do',       color: '#64748b' },
    { key: 'IN_PROGRESS',label: 'In Progress', color: '#f59e0b' },
    { key: 'DONE',       label: 'Done',        color: '#22c55e' },
  ]

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <ClipboardList size={24} style={{ color: '#4f46e5' }} />
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: '#e0e7ff' }}>No tasks yet</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {userRole === 'ADMIN' ? 'Create a task to get started' : 'No tasks have been assigned yet'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
            style={filter === tab.key
              ? { background: 'rgba(99,102,241,0.2)', color: tab.color, border: '1px solid rgba(99,102,241,0.25)' }
              : { color: 'var(--text-muted)', border: '1px solid transparent' }}
          >
            {tab.label}
            <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
              style={{ background: filter === tab.key ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)', color: filter === tab.key ? tab.color : 'var(--text-muted)' }}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CheckCircle2 size={20} className="mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tasks in this category</p>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          {filtered.map(task => {
            const isOwn = task.assignedTo?.id === currentUserId
            const isDeleting = deletingId === task.id
            const isUpdating = updatingId === task.id
            const overdue = isOverdue(task.dueDate) && task.status !== 'DONE'

            return (
              <li
                key={task.id}
                className="rounded-xl p-4 transition-all group"
                style={{
                  background: 'rgba(99,102,241,0.04)',
                  border: `1px solid ${overdue ? 'rgba(248,113,113,0.2)' : 'rgba(99,102,241,0.1)'}`,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
              >
                <div className="flex items-start gap-3">
                  {/* Status toggle button */}
                  <button
                    onClick={() => (userRole === 'ADMIN' || isOwn) && handleStatusChange(task.id, statusCycle[task.status])}
                    disabled={isUpdating || (userRole === 'MEMBER' && !isOwn)}
                    className="mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all disabled:cursor-default"
                    style={{
                      borderColor: task.status === 'DONE' ? '#22c55e' : task.status === 'IN_PROGRESS' ? '#f59e0b' : '#334155',
                      background: task.status === 'DONE' ? 'rgba(34,197,94,0.15)' : 'transparent',
                    }}
                    aria-label="Toggle status"
                  >
                    {isUpdating
                      ? <Spinner size="sm" color="#818cf8" />
                      : task.status === 'DONE'
                        ? <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                        : null}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="text-sm font-semibold leading-snug"
                        style={{
                          color: task.status === 'DONE' ? 'var(--text-muted)' : '#e0e7ff',
                          textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {userRole === 'ADMIN' && (
                          <>
                            <button
                              onClick={() => setEditingTask(task)}
                              disabled={isDeleting}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#818cf8' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                              aria-label="Edit task"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              disabled={isDeleting}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.color = '#f87171' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                              aria-label="Delete task"
                            >
                              {isDeleting ? <Spinner size="sm" color="#f87171" /> : <Trash2 size={12} />}
                            </button>
                          </>
                        )}
                        {userRole === 'MEMBER' && isOwn && (
                          <select
                            value={task.status}
                            onChange={e => handleStatusChange(task.id, e.target.value as Task['status'])}
                            disabled={isUpdating}
                            className="rounded-lg px-2 py-1 text-[11px] cursor-pointer disabled:opacity-50"
                            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        )}
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs mt-1 line-clamp-1 leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}>
                        {task.description}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <Badge type="status" value={task.status} />
                      <Badge type="priority" value={task.priority} />

                      {task.dueDate && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium"
                          style={{ color: overdue ? '#f87171' : 'var(--text-muted)' }}
                        >
                          {overdue ? <AlertCircle size={10} /> : <Calendar size={10} />}
                          {fmtDate(task.dueDate)}
                          {overdue && <span className="font-semibold">· Overdue</span>}
                        </span>
                      )}

                      {task.assignedTo && (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={task.assignedTo.name} size="xs" />
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {task.assignedTo.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editingTask && (
        <TaskModal
          projectId={projectId}
          members={members}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={() => { setEditingTask(null); onTaskUpdated() }}
        />
      )}
    </>
  )
}

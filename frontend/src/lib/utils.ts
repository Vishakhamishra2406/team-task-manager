import axios from 'axios'

interface ApiValidationError { msg: string; path: string }

export function extractError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Something went wrong'
  const d = err.response?.data as { error?: string; errors?: ApiValidationError[] } | undefined
  if (!d) return 'Something went wrong'
  if (Array.isArray(d.errors) && d.errors.length > 0) return d.errors[0].msg
  return d.error ?? 'Something went wrong'
}

export function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date(new Date().toDateString())
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Returns a deterministic gradient for a given string (project name, user name, etc.) */
export function getAvatarGradient(seed: string): string {
  const gradients = [
    'linear-gradient(135deg,#6366f1,#3b82f6)',
    'linear-gradient(135deg,#8b5cf6,#6366f1)',
    'linear-gradient(135deg,#06b6d4,#3b82f6)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#ec4899,#8b5cf6)',
    'linear-gradient(135deg,#14b8a6,#6366f1)',
    'linear-gradient(135deg,#f97316,#ec4899)',
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

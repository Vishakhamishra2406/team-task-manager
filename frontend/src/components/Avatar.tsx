import { getInitials, getAvatarGradient } from '../lib/utils'

interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export default function Avatar({ name, size = 'sm', className = '' }: AvatarProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 ${sizes[size]} ${className}`}
      style={{ background: getAvatarGradient(name) }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}

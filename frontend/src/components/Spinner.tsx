interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-[3px]' }

export default function Spinner({ size = 'md', color = '#6366f1' }: SpinnerProps) {
  return (
    <span
      className={`inline-block rounded-full ${sizes[size]}`}
      style={{
        borderColor: `${color}30`,
        borderTopColor: color,
        animation: 'spin 0.7s linear infinite',
      }}
      role="status"
      aria-label="Loading"
    />
  )
}

import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto"
        style={{ background: 'var(--bg-surface)' }}
      >
        {children}
      </main>
    </div>
  )
}

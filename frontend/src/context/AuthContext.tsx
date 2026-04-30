import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import api from '../lib/api'

export interface UserDTO {
  id: string
  name: string
  email: string
}

interface AuthContextValue {
  user: UserDTO | null
  token: string | null
  login(email: string, password: string): Promise<void>
  signup(name: string, email: string, password: string): Promise<void>
  logout(): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<UserDTO | null>(null)

  // On mount, if a token exists, fetch the current user from /api/auth/me
  useEffect(() => {
    if (!token) return

    api
      .get<UserDTO>('/api/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        // Token is invalid or expired — clear it
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      })
  }, [token])

  async function login(email: string, password: string): Promise<void> {
    const res = await api.post<{ token: string; user: UserDTO }>('/api/auth/login', {
      email,
      password,
    })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  async function signup(name: string, email: string, password: string): Promise<void> {
    const res = await api.post<{ token: string; user: UserDTO }>('/api/auth/signup', {
      name,
      email,
      password,
    })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  function logout(): void {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

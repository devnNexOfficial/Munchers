import { create } from 'zustand'

import type { UserRole } from '../types/auth'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  has_mfa: boolean
  updated_at: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  initializeFromServer: (payload: { user: AuthUser | null; token: string | null }) => void
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  setUser: (user: AuthUser | null) => set(() => ({ user })),
  setToken: (token: string | null) => set(() => ({ token })),
  logout: () => set(() => ({ user: null, token: null })),
  initializeFromServer: (payload: { user: AuthUser | null; token: string | null }) =>
    set(() => ({ user: payload.user, token: payload.token })),
}))

export default useAuthStore

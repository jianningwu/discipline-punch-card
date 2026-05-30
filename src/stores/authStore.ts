import { create } from 'zustand'
import type { User } from '@/types'
import { api } from '@/database/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api.login(username, password)
      if (result.success) {
        const user = result.user
        set({ user, isAuthenticated: true, isLoading: false })
        localStorage.setItem('dpc_user', JSON.stringify(user))
        return true
      } else {
        set({ error: result.error, isLoading: false })
        return false
      }
    } catch (err) {
      set({ error: '登录失败，请检查网络连接', isLoading: false })
      return false
    }
  },

  register: async (username: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api.register(username, password)
      if (result.success) {
        set({ isLoading: false })
        return true
      } else {
        set({ error: result.error, isLoading: false })
        return false
      }
    } catch (err) {
      set({ error: '注册失败，请稍后重试', isLoading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('dpc_user')
    localStorage.removeItem('dpc_settings')
    set({ user: null, isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),
}))

// Initialize from localStorage on app start
export function initAuthFromStorage(): void {
  const stored = localStorage.getItem('dpc_user')
  if (stored) {
    try {
      const user = JSON.parse(stored)
      useAuthStore.setState({ user, isAuthenticated: true })
    } catch {
      localStorage.removeItem('dpc_user')
    }
  }
}

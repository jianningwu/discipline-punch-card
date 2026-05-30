import { create } from 'zustand'
import type { UserSettings, UpdateSettingsRequest } from '@/types'
import { api } from '@/database/api'

interface SettingsState {
  settings: UserSettings | null
  isLoading: boolean

  loadSettings: (userId: number) => Promise<void>
  updateSettings: (userId: number, updates: UpdateSettingsRequest) => Promise<boolean>
  setTheme: (theme: string) => void
  getThemeClass: () => string
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,

  loadSettings: async (userId: number) => {
    set({ isLoading: true })
    try {
      const result = await api.getSettings(userId)
      if (result.success && result.settings) {
        set({ settings: result.settings, isLoading: false })
        applyThemeToBody(result.settings.theme)
        localStorage.setItem('dpc_settings', JSON.stringify(result.settings))
      } else {
        // Default settings
        const defaults: UserSettings = {
          id: 0,
          user_id: userId,
          theme: 'light',
          background_type: 'gradient',
          background_value: 'default',
          language: 'zh-CN',
          clock_format: '24h',
        }
        set({ settings: defaults, isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  updateSettings: async (userId: number, updates: UpdateSettingsRequest) => {
    try {
      const result = await api.updateSettings(userId, updates)
      if (result.success && result.settings) {
        set({ settings: result.settings })
        if (updates.theme) applyThemeToBody(updates.theme)
        localStorage.setItem('dpc_settings', JSON.stringify(result.settings))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  setTheme: (theme: string) => {
    set((state) => ({
      settings: state.settings ? { ...state.settings, theme } : null,
    }))
    applyThemeToBody(theme)
  },

  getThemeClass: () => {
    const theme = get().settings?.theme || 'light'
    switch (theme) {
      case 'forest': return 'theme-forest'
      case 'ocean': return 'theme-ocean'
      case 'sunset': return 'theme-sunset'
      case 'purple': return 'theme-purple'
      case 'dark': return 'dark'
      default: return ''
    }
  },
}))

function applyThemeToBody(theme: string) {
  const root = document.documentElement
  // Remove all theme classes
  root.classList.remove('dark', 'theme-forest', 'theme-ocean', 'theme-sunset', 'theme-purple')

  switch (theme) {
    case 'dark':
      root.classList.add('dark')
      break
    case 'forest':
      root.classList.add('theme-forest')
      break
    case 'ocean':
      root.classList.add('theme-ocean')
      break
    case 'sunset':
      root.classList.add('theme-sunset')
      break
    case 'purple':
      root.classList.add('theme-purple')
      break
    default:
      // 'light' - default, no class needed
      break
  }
}

// Initialize settings from localStorage
export function initSettingsFromStorage(): void {
  const stored = localStorage.getItem('dpc_settings')
  if (stored) {
    try {
      const settings = JSON.parse(stored)
      useSettingsStore.setState({ settings })
      applyThemeToBody(settings.theme || 'light')
    } catch {
      localStorage.removeItem('dpc_settings')
    }
  }
}

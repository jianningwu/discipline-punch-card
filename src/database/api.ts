/**
 * API abstraction layer - works with Electron IPC or browser localStorage
 * In production, this uses Electron's IPC bridge.
 * In development (browser), it uses localStorage for mock data.
 */

import type {
  CheckInItem, CheckInRecord, CheckInStats, CalendarDataItem,
  UserSettings, CreateItemRequest, UpdateItemRequest,
  CreateRecordRequest, UpdateSettingsRequest,
} from '@/types'

// Detect if running in Electron
const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI

function getAPI() {
  if (isElectron) {
    return (window as any).electronAPI
  }
  // Browser mock for development
  return getMockAPI()
}

// ============ Mock API for browser development ============
function getMockAPI() {
  const DB_PREFIX = 'dpc_'

  function getDB<T>(key: string): T[] {
    const data = localStorage.getItem(DB_PREFIX + key)
    return data ? JSON.parse(data) : []
  }

  function setDB<T>(key: string, data: T[]): void {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(data))
  }

  // Initialize with demo data if empty
  function initDemoData(userId: number) {
    const items = getDB<CheckInItem>('items')
    if (items.length === 0) {
      const defaultItems: CheckInItem[] = [
        { id: 1, user_id: userId, name: '运动锻炼', description: '每天运动30分钟', icon: '🏃', color: '#ef4444', is_default: 1, sort_order: 1, is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, user_id: userId, name: '阅读学习', description: '每天阅读至少30分钟', icon: '📚', color: '#3b82f6', is_default: 1, sort_order: 2, is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, user_id: userId, name: '早睡早起', description: '晚上11点前睡觉', icon: '💤', color: '#8b5cf6', is_default: 1, sort_order: 3, is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 4, user_id: userId, name: '喝水', description: '每天喝8杯水', icon: '💧', color: '#06b6d4', is_default: 1, sort_order: 4, is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 5, user_id: userId, name: '冥想', description: '每天冥想10分钟', icon: '🧘', color: '#10b981', is_default: 1, sort_order: 5, is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 6, user_id: userId, name: '写日记', description: '记录今天的心情和收获', icon: '📝', color: '#f59e0b', is_default: 1, sort_order: 6, is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 7, user_id: userId, name: '健康饮食', description: '三餐规律，少油少盐', icon: '🍎', color: '#84cc16', is_default: 1, sort_order: 7, is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 8, user_id: userId, name: '编程学习', description: '每天至少写1小时代码', icon: '💻', color: '#6366f1', is_default: 1, sort_order: 8, is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ]
      setDB('items', defaultItems)
    }
  }

  return {
    register: async (username: string, password: string) => {
      const users = getDB<any>('users')
      if (users.find((u: any) => u.username === username)) {
        return { success: false, error: '用户名已存在' }
      }
      const newUser = {
        id: Date.now(),
        username,
        password_hash: btoa(password), // Simple hash for mock
        created_at: new Date().toISOString(),
      }
      users.push(newUser)
      setDB('users', users)

      // Create settings
      const settings = getDB<any>('settings')
      settings.push({ id: Date.now(), user_id: newUser.id, theme: 'light', background_type: 'gradient', background_value: 'default', language: 'zh-CN', clock_format: '24h' })
      setDB('settings', settings)

      initDemoData(newUser.id)
      return { success: true, userId: newUser.id }
    },

    login: async (username: string, password: string) => {
      const users = getDB<any>('users')
      const user = users.find((u: any) => u.username === username)
      if (!user) return { success: false, error: '用户不存在' }
      if (user.password_hash !== btoa(password)) return { success: false, error: '密码错误' }
      return { success: true, user: { id: user.id, username: user.username, createdAt: user.created_at } }
    },

    getItems: async (userId: number) => {
      const items = getDB<CheckInItem>('items').filter(i => i.user_id === userId && i.is_active === 1)
      return { success: true, items }
    },

    createItem: async (userId: number, item: CreateItemRequest) => {
      const items = getDB<CheckInItem>('items')
      const maxOrder = Math.max(0, ...items.filter(i => i.user_id === userId).map(i => i.sort_order))
      const newItem: CheckInItem = {
        id: Date.now(),
        user_id: userId,
        name: item.name,
        description: item.description || '',
        icon: item.icon || 'star',
        color: item.color || '#6366f1',
        is_default: 0,
        sort_order: maxOrder + 1,
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      items.push(newItem)
      setDB('items', items)
      return { success: true, item: newItem }
    },

    updateItem: async (itemId: number, updates: UpdateItemRequest) => {
      const items = getDB<CheckInItem>('items')
      const idx = items.findIndex(i => i.id === itemId)
      if (idx === -1) return { success: false, error: '项目不存在' }
      items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() }
      setDB('items', items)
      return { success: true, item: items[idx] }
    },

    deleteItem: async (itemId: number) => {
      const items = getDB<CheckInItem>('items')
      const idx = items.findIndex(i => i.id === itemId)
      if (idx === -1) return { success: false, error: '项目不存在' }
      items[idx].is_active = 0
      setDB('items', items)
      return { success: true }
    },

    getRecordsByDate: async (userId: number, date: string) => {
      const records = getDB<any>('records')
        .filter((r: any) => r.user_id === userId && r.check_date === date)
      const items = getDB<CheckInItem>('items')
      const enriched = records.map((r: any) => {
        const item = items.find(i => i.id === r.item_id)
        return { ...r, item_name: item?.name, item_icon: item?.icon, item_color: item?.color }
      })
      return { success: true, records: enriched }
    },

    createRecord: async (userId: number, record: CreateRecordRequest) => {
      const records = getDB<any>('records')
      // Remove existing record for same user+item+date
      const existIdx = records.findIndex(
        (r: any) => r.user_id === userId && r.item_id === record.item_id && r.check_date === record.check_date
      )
      if (existIdx !== -1) records.splice(existIdx, 1)

      const newRecord = {
        id: Date.now(),
        user_id: userId,
        item_id: record.item_id,
        check_date: record.check_date,
        content: record.content || '',
        mood: record.mood || '',
        created_at: new Date().toISOString(),
      }
      records.push(newRecord)
      setDB('records', records)

      const items = getDB<CheckInItem>('items')
      const item = items.find(i => i.id === record.item_id)
      return { success: true, record: { ...newRecord, item_name: item?.name, item_icon: item?.icon, item_color: item?.color } }
    },

    updateRecord: async (recordId: number, updates: { content?: string; mood?: string }) => {
      const records = getDB<any>('records')
      const idx = records.findIndex((r: any) => r.id === recordId)
      if (idx === -1) return { success: false, error: '记录不存在' }
      records[idx] = { ...records[idx], ...updates }
      setDB('records', records)
      return { success: true, record: records[idx] }
    },

    deleteRecord: async (recordId: number) => {
      const records = getDB<any>('records')
      const idx = records.findIndex((r: any) => r.id === recordId)
      if (idx !== -1) {
        records.splice(idx, 1)
        setDB('records', records)
      }
      return { success: true }
    },

    getStats: async (userId: number) => {
      const items = getDB<CheckInItem>('items').filter(i => i.user_id === userId && i.is_active === 1)
      const records = getDB<any>('records').filter((r: any) => r.user_id === userId)
      const today = new Date().toISOString().split('T')[0]
      const todayRecords = records.filter((r: any) => r.check_date === today)

      // Calculate streak
      const dates = [...new Set(records.map((r: any) => r.check_date))].sort().reverse()
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 1

      if (dates.length > 0) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        if (dates[0] === today || dates[0] === yesterday) {
          currentStreak = 1
          for (let i = 1; i < dates.length; i++) {
            const diff = (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000
            if (diff === 1) currentStreak++
            else break
          }
        }
        for (let i = 1; i < dates.length; i++) {
          const diff = (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000
          if (diff === 1) tempStreak++
          else { longestStreak = Math.max(longestStreak, tempStreak); tempStreak = 1 }
        }
        longestStreak = Math.max(longestStreak, tempStreak)
      }

      return {
        success: true,
        stats: {
          totalItems: items.length,
          todayCompleted: todayRecords.length,
          totalRecords: records.length,
          currentStreak,
          longestStreak,
          monthlyRecords: [] as any[],
        },
      }
    },

    getCalendarData: async (userId: number, year: number, month?: number) => {
      const records = getDB<any>('records').filter((r: any) => r.user_id === userId)
      const data: Record<string, any> = {}
      records.forEach((r: any) => {
        const d = r.check_date
        if (month !== undefined) {
          if (!d.startsWith(`${year}-${String(month).padStart(2, '0')}`)) return
        } else if (!d.startsWith(`${year}`)) return
        if (!data[d]) data[d] = { check_date: d, count: 0, items: new Set() }
        data[d].count++
        data[d].items.add(r.item_id)
      })
      return {
        success: true,
        data: Object.values(data).map((d: any) => ({ ...d, items: Array.from(d.items).join(',') })),
      }
    },

    getSettings: async (userId: number) => {
      const settings = getDB<any>('settings').find((s: any) => s.user_id === userId)
      return { success: true, settings: settings || { theme: 'light', background_type: 'gradient', background_value: 'default', clock_format: '24h' } }
    },

    updateSettings: async (userId: number, updates: UpdateSettingsRequest) => {
      const settings = getDB<any>('settings')
      const idx = settings.findIndex((s: any) => s.user_id === userId)
      if (idx === -1) {
        settings.push({ id: Date.now(), user_id: userId, ...updates })
      } else {
        settings[idx] = { ...settings[idx], ...updates }
      }
      setDB('settings', settings)
      return { success: true, settings: settings[idx !== -1 ? idx : settings.length - 1] }
    },
  }
}

// Export the API
export const api = getAPI()

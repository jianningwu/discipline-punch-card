import { create } from 'zustand'
import type { CheckInItem, CheckInRecord, CheckInStats, CreateItemRequest, CreateRecordRequest } from '@/types'
import { api } from '@/database/api'

interface CheckInState {
  items: CheckInItem[]
  todayRecords: CheckInRecord[]
  currentDateRecords: CheckInRecord[]
  stats: CheckInStats | null
  isLoading: boolean
  error: string | null

  // Items
  loadItems: (userId: number) => Promise<void>
  createItem: (userId: number, item: CreateItemRequest) => Promise<boolean>
  updateItem: (itemId: number, updates: Partial<CheckInItem>) => Promise<boolean>
  deleteItem: (itemId: number) => Promise<boolean>

  // Records
  loadRecordsByDate: (userId: number, date: string) => Promise<void>
  loadTodayRecords: (userId: number) => Promise<void>
  createRecord: (userId: number, record: CreateRecordRequest) => Promise<boolean>
  updateRecord: (recordId: number, updates: { content?: string; mood?: string }) => Promise<boolean>
  deleteRecord: (recordId: number) => Promise<boolean>

  // Stats
  loadStats: (userId: number) => Promise<void>

  clearError: () => void
}

export const useCheckInStore = create<CheckInState>((set, get) => ({
  items: [],
  todayRecords: [],
  currentDateRecords: [],
  stats: null,
  isLoading: false,
  error: null,

  loadItems: async (userId: number) => {
    set({ isLoading: true })
    try {
      const result = await api.getItems(userId)
      if (result.success) {
        set({ items: result.items, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch {
      set({ error: '加载打卡项目失败', isLoading: false })
    }
  },

  createItem: async (userId: number, item: CreateItemRequest) => {
    try {
      const result = await api.createItem(userId, item)
      if (result.success) {
        set((state) => ({ items: [...state.items, result.item] }))
        return true
      } else {
        set({ error: result.error })
        return false
      }
    } catch {
      set({ error: '创建项目失败' })
      return false
    }
  },

  updateItem: async (itemId: number, updates: Partial<CheckInItem>) => {
    try {
      const result = await api.updateItem(itemId, updates)
      if (result.success) {
        set((state) => ({
          items: state.items.map((i) => (i.id === itemId ? { ...i, ...result.item } : i)),
        }))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  deleteItem: async (itemId: number) => {
    try {
      const result = await api.deleteItem(itemId)
      if (result.success) {
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        }))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  loadRecordsByDate: async (userId: number, date: string) => {
    set({ isLoading: true })
    try {
      const result = await api.getRecordsByDate(userId, date)
      if (result.success) {
        set({ currentDateRecords: result.records, isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  loadTodayRecords: async (userId: number) => {
    const today = new Date().toISOString().split('T')[0]
    try {
      const result = await api.getRecordsByDate(userId, today)
      if (result.success) {
        set({ todayRecords: result.records })
      }
    } catch {
      // Silent fail for this background load
    }
  },

  createRecord: async (userId: number, record: CreateRecordRequest) => {
    try {
      const result = await api.createRecord(userId, record)
      if (result.success) {
        const newRecord = result.record
        set((state) => ({
          todayRecords: [...state.todayRecords.filter(
            (r) => !(r.item_id === record.item_id && r.check_date === record.check_date)
          ), newRecord],
          currentDateRecords: [...state.currentDateRecords.filter(
            (r) => !(r.item_id === record.item_id && r.check_date === record.check_date)
          ), newRecord],
        }))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  updateRecord: async (recordId: number, updates: { content?: string; mood?: string }) => {
    try {
      const result = await api.updateRecord(recordId, updates)
      if (result.success) {
        set((state) => ({
          todayRecords: state.todayRecords.map((r) => (r.id === recordId ? { ...r, ...result.record } : r)),
          currentDateRecords: state.currentDateRecords.map((r) => (r.id === recordId ? { ...r, ...result.record } : r)),
        }))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  deleteRecord: async (recordId: number) => {
    try {
      const result = await api.deleteRecord(recordId)
      if (result.success) {
        set((state) => ({
          todayRecords: state.todayRecords.filter((r) => r.id !== recordId),
          currentDateRecords: state.currentDateRecords.filter((r) => r.id !== recordId),
        }))
        return true
      }
      return false
    } catch {
      return false
    }
  },

  loadStats: async (userId: number) => {
    try {
      const result = await api.getStats(userId)
      if (result.success) {
        set({ stats: result.stats })
      }
    } catch {
      // Silent fail
    }
  },

  clearError: () => set({ error: null }),
}))

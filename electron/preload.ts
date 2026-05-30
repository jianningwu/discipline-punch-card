import { contextBridge, ipcRenderer } from 'electron'

// Type-safe API exposed to renderer process
const api = {
  // Auth
  register: (username: string, password: string) =>
    ipcRenderer.invoke('auth:register', username, password),
  login: (username: string, password: string) =>
    ipcRenderer.invoke('auth:login', username, password),

  // Check-in Items
  getItems: (userId: number) =>
    ipcRenderer.invoke('items:list', userId),
  createItem: (userId: number, item: { name: string; description?: string; icon?: string; color?: string }) =>
    ipcRenderer.invoke('items:create', userId, item),
  updateItem: (itemId: number, updates: Record<string, any>) =>
    ipcRenderer.invoke('items:update', itemId, updates),
  deleteItem: (itemId: number) =>
    ipcRenderer.invoke('items:delete', itemId),

  // Check-in Records
  getRecordsByDate: (userId: number, date: string) =>
    ipcRenderer.invoke('records:get-by-date', userId, date),
  createRecord: (userId: number, record: { item_id: number; check_date: string; content?: string; mood?: string }) =>
    ipcRenderer.invoke('records:create', userId, record),
  updateRecord: (recordId: number, updates: { content?: string; mood?: string }) =>
    ipcRenderer.invoke('records:update', recordId, updates),
  deleteRecord: (recordId: number) =>
    ipcRenderer.invoke('records:delete', recordId),

  // Statistics
  getStats: (userId: number) =>
    ipcRenderer.invoke('records:get-stats', userId),
  getCalendarData: (userId: number, year: number, month?: number) =>
    ipcRenderer.invoke('records:get-calendar-data', userId, year, month),

  // Settings
  getSettings: (userId: number) =>
    ipcRenderer.invoke('settings:get', userId),
  updateSettings: (userId: number, updates: Record<string, any>) =>
    ipcRenderer.invoke('settings:update', userId, updates),
}

contextBridge.exposeInMainWorld('electronAPI', api)

// Type declaration for renderer
export type ElectronAPI = typeof api

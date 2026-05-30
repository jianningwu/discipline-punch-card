import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { initDatabase, getDatabase } from './database'

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: '自律打卡',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: true,
    backgroundColor: '#f8fafc',
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Initialize database and IPC handlers
function setupIPC() {
  const db = getDatabase()

  // ============ Auth Handlers ============
  ipcMain.handle('auth:register', (_event, username: string, password: string) => {
    try {
      const crypto = require('crypto')
      const hash = crypto.createHash('sha256').update(password).digest('hex')
      const stmt = db.prepare(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)'
      )
      const result = stmt.run(username, hash)
      // Create default settings for new user
      db.prepare(
        'INSERT INTO user_settings (user_id) VALUES (?)'
      ).run(result.lastInsertRowid)
      // Create default check-in items for new user
      createDefaultItems(db, Number(result.lastInsertRowid))
      return { success: true, userId: result.lastInsertRowid }
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        return { success: false, error: '用户名已存在' }
      }
      return { success: false, error: '注册失败，请稍后重试' }
    }
  })

  ipcMain.handle('auth:login', (_event, username: string, password: string) => {
    try {
      const crypto = require('crypto')
      const hash = crypto.createHash('sha256').update(password).digest('hex')
      const user = db.prepare(
        'SELECT id, username, password_hash, created_at FROM users WHERE username = ?'
      ).get(username) as any

      if (!user) {
        return { success: false, error: '用户不存在' }
      }
      if (user.password_hash !== hash) {
        return { success: false, error: '密码错误' }
      }
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.created_at,
        },
      }
    } catch (err) {
      return { success: false, error: '登录失败，请稍后重试' }
    }
  })

  // ============ Check-in Items Handlers ============
  ipcMain.handle('items:list', (_event, userId: number) => {
    try {
      const items = db.prepare(
        'SELECT * FROM check_in_items WHERE user_id = ? AND is_active = 1 ORDER BY sort_order ASC'
      ).all(userId)
      return { success: true, items }
    } catch (err) {
      return { success: false, error: '获取打卡项目失败', items: [] }
    }
  })

  ipcMain.handle('items:create', (_event, userId: number, item: {
    name: string
    description?: string
    icon?: string
    color?: string
  }) => {
    try {
      const maxOrder = db.prepare(
        'SELECT MAX(sort_order) as max_order FROM check_in_items WHERE user_id = ?'
      ).get(userId) as any
      const sortOrder = (maxOrder?.max_order ?? 0) + 1

      const result = db.prepare(
        `INSERT INTO check_in_items (user_id, name, description, icon, color, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(userId, item.name, item.description || '', item.icon || 'star', item.color || '#6366f1', sortOrder)

      const newItem = db.prepare('SELECT * FROM check_in_items WHERE id = ?').get(result.lastInsertRowid)
      return { success: true, item: newItem }
    } catch (err) {
      return { success: false, error: '创建打卡项目失败' }
    }
  })

  ipcMain.handle('items:update', (_event, itemId: number, updates: {
    name?: string
    description?: string
    icon?: string
    color?: string
    is_active?: number
    sort_order?: number
  }) => {
    try {
      const fields: string[] = []
      const values: any[] = []
      for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = ?`)
        values.push(value)
      }
      values.push(itemId)
      db.prepare(
        `UPDATE check_in_items SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).run(...values)

      const updated = db.prepare('SELECT * FROM check_in_items WHERE id = ?').get(itemId)
      return { success: true, item: updated }
    } catch (err) {
      return { success: false, error: '更新打卡项目失败' }
    }
  })

  ipcMain.handle('items:delete', (_event, itemId: number) => {
    try {
      // Soft delete
      db.prepare('UPDATE check_in_items SET is_active = 0 WHERE id = ?').run(itemId)
      return { success: true }
    } catch (err) {
      return { success: false, error: '删除打卡项目失败' }
    }
  })

  // ============ Check-in Records Handlers ============
  ipcMain.handle('records:get-by-date', (_event, userId: number, date: string) => {
    try {
      const records = db.prepare(`
        SELECT r.*, i.name as item_name, i.icon as item_icon, i.color as item_color
        FROM check_in_records r
        JOIN check_in_items i ON r.item_id = i.id
        WHERE r.user_id = ? AND r.check_date = ?
      `).all(userId, date)
      return { success: true, records }
    } catch (err) {
      return { success: false, error: '获取打卡记录失败', records: [] }
    }
  })

  ipcMain.handle('records:create', (_event, userId: number, record: {
    item_id: number
    check_date: string
    content?: string
    mood?: string
  }) => {
    try {
      const result = db.prepare(`
        INSERT OR REPLACE INTO check_in_records (user_id, item_id, check_date, content, mood)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, record.item_id, record.check_date, record.content || '', record.mood || '')

      const newRecord = db.prepare(`
        SELECT r.*, i.name as item_name, i.icon as item_icon, i.color as item_color
        FROM check_in_records r
        JOIN check_in_items i ON r.item_id = i.id
        WHERE r.id = ?
      `).get(result.lastInsertRowid)
      return { success: true, record: newRecord }
    } catch (err) {
      return { success: false, error: '打卡失败' }
    }
  })

  ipcMain.handle('records:update', (_event, recordId: number, updates: {
    content?: string
    mood?: string
  }) => {
    try {
      const fields: string[] = []
      const values: any[] = []
      for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = ?`)
        values.push(value)
      }
      values.push(recordId)
      db.prepare(
        `UPDATE check_in_records SET ${fields.join(', ')} WHERE id = ?`
      ).run(...values)

      const updated = db.prepare(`
        SELECT r.*, i.name as item_name, i.icon as item_icon, i.color as item_color
        FROM check_in_records r
        JOIN check_in_items i ON r.item_id = i.id
        WHERE r.id = ?
      `).get(recordId)
      return { success: true, record: updated }
    } catch (err) {
      return { success: false, error: '更新打卡记录失败' }
    }
  })

  ipcMain.handle('records:delete', (_event, recordId: number) => {
    try {
      db.prepare('DELETE FROM check_in_records WHERE id = ?').run(recordId)
      return { success: true }
    } catch (err) {
      return { success: false, error: '删除打卡记录失败' }
    }
  })

  ipcMain.handle('records:get-stats', (_event, userId: number) => {
    try {
      const totalItems = db.prepare(
        'SELECT COUNT(*) as count FROM check_in_items WHERE user_id = ? AND is_active = 1'
      ).get(userId) as any

      const today = new Date().toISOString().split('T')[0]
      const todayRecords = db.prepare(
        'SELECT COUNT(*) as count FROM check_in_records WHERE user_id = ? AND check_date = ?'
      ).get(userId, today) as any

      const totalRecords = db.prepare(
        'SELECT COUNT(*) as count FROM check_in_records WHERE user_id = ?'
      ).get(userId) as any

      // Streak calculation
      const streak = calculateStreak(db, userId)

      // Monthly completion
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0]
      const monthRecords = db.prepare(
        `SELECT r.check_date, COUNT(*) as count
         FROM check_in_records r
         WHERE r.user_id = ? AND r.check_date >= ?
         GROUP BY r.check_date
         ORDER BY r.check_date`
      ).all(userId, monthStart) as any[]

      return {
        success: true,
        stats: {
          totalItems: totalItems.count,
          todayCompleted: todayRecords.count,
          totalRecords: totalRecords.count,
          currentStreak: streak.current,
          longestStreak: streak.longest,
          monthlyRecords: monthRecords,
        },
      }
    } catch (err) {
      return { success: false, error: '获取统计数据失败' }
    }
  })

  ipcMain.handle('records:get-calendar-data', (_event, userId: number, year: number, month?: number) => {
    try {
      let query: string
      let params: any[]
      if (month !== undefined) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`
        query = `
          SELECT r.check_date, COUNT(*) as count, GROUP_CONCAT(i.name) as items
          FROM check_in_records r
          JOIN check_in_items i ON r.item_id = i.id
          WHERE r.user_id = ? AND r.check_date >= ? AND r.check_date <= ?
          GROUP BY r.check_date
        `
        params = [userId, startDate, endDate]
      } else {
        const startDate = `${year}-01-01`
        const endDate = `${year}-12-31`
        query = `
          SELECT r.check_date, COUNT(*) as count
          FROM check_in_records r
          WHERE r.user_id = ? AND r.check_date >= ? AND r.check_date <= ?
          GROUP BY r.check_date
        `
        params = [userId, startDate, endDate]
      }

      const data = db.prepare(query).all(...params)
      return { success: true, data }
    } catch (err) {
      return { success: false, error: '获取日历数据失败', data: [] }
    }
  })

  // ============ Settings Handlers ============
  ipcMain.handle('settings:get', (_event, userId: number) => {
    try {
      const settings = db.prepare(
        'SELECT * FROM user_settings WHERE user_id = ?'
      ).get(userId)
      return { success: true, settings }
    } catch (err) {
      return { success: false, error: '获取设置失败' }
    }
  })

  ipcMain.handle('settings:update', (_event, userId: number, updates: {
    theme?: string
    background_type?: string
    background_value?: string
    language?: string
    clock_format?: string
  }) => {
    try {
      const fields: string[] = []
      const values: any[] = []
      for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = ?`)
        values.push(value)
      }
      values.push(userId)
      db.prepare(
        `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`
      ).run(...values)

      const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId)
      return { success: true, settings }
    } catch (err) {
      return { success: false, error: '更新设置失败' }
    }
  })
}

function calculateStreak(db: any, userId: number): { current: number; longest: number } {
  const records = db.prepare(`
    SELECT DISTINCT check_date
    FROM check_in_records
    WHERE user_id = ?
    ORDER BY check_date DESC
  `).all(userId) as any[]

  if (records.length === 0) return { current: 0, longest: 0 }

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Calculate current streak
  if (records[0].check_date === today || records[0].check_date === yesterday) {
    currentStreak = 1
    for (let i = 1; i < records.length; i++) {
      const current = new Date(records[i - 1].check_date)
      const prev = new Date(records[i].check_date)
      const diff = (current.getTime() - prev.getTime()) / 86400000
      if (diff === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < records.length; i++) {
    const current = new Date(records[i - 1].check_date)
    const prev = new Date(records[i].check_date)
    const diff = (current.getTime() - prev.getTime()) / 86400000
    if (diff === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return { current: currentStreak, longest: longestStreak }
}

function createDefaultItems(db: any, userId: number) {
  const defaults = [
    { name: '运动锻炼', icon: '🏃', color: '#ef4444', description: '每天运动30分钟' },
    { name: '阅读学习', icon: '📚', color: '#3b82f6', description: '每天阅读至少30分钟' },
    { name: '早睡早起', icon: '💤', color: '#8b5cf6', description: '晚上11点前睡觉，早上7点起床' },
    { name: '喝水', icon: '💧', color: '#06b6d4', description: '每天喝8杯水' },
    { name: '冥想', icon: '🧘', color: '#10b981', description: '每天冥想10分钟' },
    { name: '写日记', icon: '📝', color: '#f59e0b', description: '记录今天的心情和收获' },
    { name: '健康饮食', icon: '🍎', color: '#84cc16', description: '三餐规律，少油少盐' },
    { name: '编程学习', icon: '💻', color: '#6366f1', description: '每天至少写1小时代码' },
  ]

  const stmt = db.prepare(`
    INSERT INTO check_in_items (user_id, name, description, icon, color, is_default, sort_order)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `)

  const insertMany = db.transaction(() => {
    defaults.forEach((item, index) => {
      stmt.run(userId, item.name, item.description, item.icon, item.color, index + 1)
    })
  })

  insertMany()
}

// App lifecycle
app.whenReady().then(() => {
  initDatabase()
  setupIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

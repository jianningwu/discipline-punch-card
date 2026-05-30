import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

let db: Database.Database | null = null

export function initDatabase(): void {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  const dbPath = isDev
    ? path.join(app.getPath('userData'), 'discipline-punch-card.db')
    : path.join(app.getPath('userData'), 'discipline-punch-card.db')

  db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  createTables()
}

function createTables(): void {
  if (!db) return

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS check_in_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT 'check',
      color TEXT DEFAULT '#6366f1',
      is_default INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS check_in_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      check_date DATE NOT NULL,
      content TEXT DEFAULT '',
      mood TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES check_in_items(id) ON DELETE CASCADE,
      UNIQUE(user_id, item_id, check_date)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      theme TEXT DEFAULT 'light',
      background_type TEXT DEFAULT 'gradient',
      background_value TEXT DEFAULT 'default',
      language TEXT DEFAULT 'zh-CN',
      clock_format TEXT DEFAULT '24h',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_check_in_records_user_date
      ON check_in_records(user_id, check_date);
    CREATE INDEX IF NOT EXISTS idx_check_in_records_user_item
      ON check_in_records(user_id, item_id);
    CREATE INDEX IF NOT EXISTS idx_check_in_items_user
      ON check_in_items(user_id);
  `)
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}

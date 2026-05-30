# 📡 API 文档

## IPC 通信接口

### 认证模块

#### `auth:login` - 用户登录

```typescript
// 请求
ipcRenderer.invoke('auth:login', username: string, password: string)

// 成功响应
{
  success: true,
  user: {
    id: number,
    username: string,
    createdAt: string
  }
}

// 失败响应
{
  success: false,
  error: '用户不存在' | '密码错误' | '登录失败，请稍后重试'
}
```

#### `auth:register` - 用户注册

```typescript
// 请求
ipcRenderer.invoke('auth:register', username: string, password: string)

// 成功响应
{
  success: true,
  userId: number
}

// 失败响应
{
  success: false,
  error: '用户名已存在' | '注册失败，请稍后重试'
}
```

---

### 打卡项目管理

#### `items:list` - 获取打卡项目列表

```typescript
// 请求
ipcRenderer.invoke('items:list', userId: number)

// 响应
{
  success: true,
  items: CheckInItem[]
}

interface CheckInItem {
  id: number
  user_id: number
  name: string
  description: string
  icon: string        // Emoji 字符
  color: string       // Hex 颜色代码
  is_default: number  // 0=自定义, 1=默认
  sort_order: number
  is_active: number   // 0=已删除, 1=正常
  created_at: string
  updated_at: string
}
```

#### `items:create` - 创建打卡项目

```typescript
// 请求
ipcRenderer.invoke('items:create', userId: number, {
  name: string,
  description?: string,
  icon?: string,      // 默认 'star'
  color?: string      // 默认 '#6366f1'
})

// 响应
{
  success: true,
  item: CheckInItem
}
```

#### `items:update` - 更新打卡项目

```typescript
// 请求
ipcRenderer.invoke('items:update', itemId: number, {
  name?: string,
  description?: string,
  icon?: string,
  color?: string,
  is_active?: number,
  sort_order?: number
})

// 响应
{
  success: true,
  item: CheckInItem
}
```

#### `items:delete` - 删除打卡项目（软删除）

```typescript
// 请求
ipcRenderer.invoke('items:delete', itemId: number)

// 响应
{
  success: true
}
```

---

### 打卡记录管理

#### `records:get-by-date` - 获取指定日期的打卡记录

```typescript
// 请求
ipcRenderer.invoke('records:get-by-date', userId: number, date: string)
// date 格式: 'YYYY-MM-DD'

// 响应
{
  success: true,
  records: CheckInRecord[]
}

interface CheckInRecord {
  id: number
  user_id: number
  item_id: number
  check_date: string    // 'YYYY-MM-DD'
  content: string       // 打卡内容
  mood: string          // 心情 Emoji
  created_at: string
  item_name?: string    // 关联查询的打卡项名称
  item_icon?: string    // 关联查询的打卡项图标
  item_color?: string   // 关联查询的打卡项颜色
}
```

#### `records:create` - 创建打卡记录

```typescript
// 请求
ipcRenderer.invoke('records:create', userId: number, {
  item_id: number,
  check_date: string,   // 'YYYY-MM-DD'
  content?: string,     // 打卡内容
  mood?: string         // 心情 Emoji
})

// 说明：同一天同一项目重复打卡会覆盖旧记录（INSERT OR REPLACE）

// 响应
{
  success: true,
  record: CheckInRecord
}
```

#### `records:update` - 更新打卡记录

```typescript
// 请求
ipcRenderer.invoke('records:update', recordId: number, {
  content?: string,
  mood?: string
})

// 响应
{
  success: true,
  record: CheckInRecord
}
```

#### `records:delete` - 删除打卡记录

```typescript
// 请求
ipcRenderer.invoke('records:delete', recordId: number)

// 响应
{
  success: true
}
```

---

### 统计数据

#### `records:get-stats` - 获取用户统计数据

```typescript
// 请求
ipcRenderer.invoke('records:get-stats', userId: number)

// 响应
{
  success: true,
  stats: {
    totalItems: number,       // 打卡项目总数
    todayCompleted: number,   // 今日已完成数
    totalRecords: number,     // 总打卡记录数
    currentStreak: number,    // 当前连续打卡天数
    longestStreak: number,    // 最长连续打卡天数
    monthlyRecords: Array<{
      check_date: string,
      count: number
    }>                         // 本月每日打卡数
  }
}
```

**连续打卡计算逻辑**：
- 从最近打卡日期向前推算
- 如果最近打卡日期是今天或昨天，计入当前连续
- 日期相差正好1天算连续，否则断开
- 最长连续取历史最大值

#### `records:get-calendar-data` - 获取日历数据

```typescript
// 请求 - 月度
ipcRenderer.invoke('records:get-calendar-data', userId: number, year: number, month: number)

// 请求 - 年度
ipcRenderer.invoke('records:get-calendar-data', userId: number, year: number)

// 响应
{
  success: true,
  data: Array<{
    check_date: string,  // 'YYYY-MM-DD'
    count: number,       // 当天打卡数
    items?: string       // 打卡项名称（逗号分隔）
  }>
}
```

---

### 用户设置

#### `settings:get` - 获取用户设置

```typescript
// 请求
ipcRenderer.invoke('settings:get', userId: number)

// 响应
{
  success: true,
  settings: {
    id: number,
    user_id: number,
    theme: 'light' | 'dark' | 'forest' | 'ocean' | 'sunset' | 'purple',
    background_type: 'gradient' | 'pattern' | 'solid',
    background_value: string,
    language: string,
    clock_format: '24h' | '12h'
  }
}
```

#### `settings:update` - 更新用户设置

```typescript
// 请求
ipcRenderer.invoke('settings:update', userId: number, {
  theme?: string,
  background_type?: string,
  background_value?: string,
  language?: string,
  clock_format?: string
})

// 响应
{
  success: true,
  settings: UserSettings
}
```

---

## 数据库 Schema

### 完整建表语句

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE check_in_items (
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

CREATE TABLE check_in_records (
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

CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  theme TEXT DEFAULT 'light',
  background_type TEXT DEFAULT 'gradient',
  background_value TEXT DEFAULT 'default',
  language TEXT DEFAULT 'zh-CN',
  clock_format TEXT DEFAULT '24h',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 索引

```sql
CREATE INDEX idx_check_in_records_user_date
  ON check_in_records(user_id, check_date);
CREATE INDEX idx_check_in_records_user_item
  ON check_in_records(user_id, item_id);
CREATE INDEX idx_check_in_items_user
  ON check_in_items(user_id);
```

### 默认数据

新用户注册后，自动创建8个默认打卡项：

| sort_order | name | icon | color | description |
|------------|------|------|-------|-------------|
| 1 | 运动锻炼 | 🏃 | #ef4444 | 每天运动30分钟 |
| 2 | 阅读学习 | 📚 | #3b82f6 | 每天阅读至少30分钟 |
| 3 | 早睡早起 | 💤 | #8b5cf6 | 晚上11点前睡觉，早上7点起床 |
| 4 | 喝水 | 💧 | #06b6d4 | 每天喝8杯水 |
| 5 | 冥想 | 🧘 | #10b981 | 每天冥想10分钟 |
| 6 | 写日记 | 📝 | #f59e0b | 记录今天的心情和收获 |
| 7 | 健康饮食 | 🍎 | #84cc16 | 三餐规律，少油少盐 |
| 8 | 编程学习 | 💻 | #6366f1 | 每天至少写1小时代码 |

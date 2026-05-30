// ============ User Types ============
export interface User {
  id: number
  username: string
  createdAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  confirmPassword: string
}

// ============ Check-in Item Types ============
export interface CheckInItem {
  id: number
  user_id: number
  name: string
  description: string
  icon: string
  color: string
  is_default: number
  sort_order: number
  is_active: number
  created_at: string
  updated_at: string
}

export interface CreateItemRequest {
  name: string
  description?: string
  icon?: string
  color?: string
}

export interface UpdateItemRequest {
  name?: string
  description?: string
  icon?: string
  color?: string
  is_active?: number
  sort_order?: number
}

// ============ Check-in Record Types ============
export interface CheckInRecord {
  id: number
  user_id: number
  item_id: number
  check_date: string
  content: string
  mood: string
  created_at: string
  item_name?: string
  item_icon?: string
  item_color?: string
}

export interface CreateRecordRequest {
  item_id: number
  check_date: string
  content?: string
  mood?: string
}

// ============ Statistics Types ============
export interface CheckInStats {
  totalItems: number
  todayCompleted: number
  totalRecords: number
  currentStreak: number
  longestStreak: number
  monthlyRecords: { check_date: string; count: number }[]
}

export interface CalendarDataItem {
  check_date: string
  count: number
  items?: string
}

// ============ Settings Types ============
export interface UserSettings {
  id: number
  user_id: number
  theme: string
  background_type: string
  background_value: string
  language: string
  clock_format: string
}

export interface UpdateSettingsRequest {
  theme?: string
  background_type?: string
  background_value?: string
  language?: string
  clock_format?: string
}

// ============ API Response Types ============
export interface APIResponse<T = any> {
  success: boolean
  error?: string
  data?: T
}

// ============ Theme Types ============
export interface Theme {
  id: string
  name: string
  description: string
  className: string
  preview: string
}

export interface BackgroundOption {
  id: string
  name: string
  type: 'gradient' | 'image' | 'solid'
  value: string
}

// ============ Emoji/Avatar Options ============
export const EMOJI_OPTIONS = [
  '🏃', '📚', '💤', '💧', '🧘', '📝', '🍎', '💻',
  '🎵', '🎨', '✈️', '🏋️', '🎯', '💡', '🌟', '❤️',
  '🌱', '🎮', '📷', '🍳', '🧹', '🐕', '🌍', '☕',
  '🎸', '⚽', '🏀', '🎾', '🚴', '🏊', '🧗', '💪',
]

export const COLOR_OPTIONS = [
  { name: '红色', value: '#ef4444' },
  { name: '橙色', value: '#f97316' },
  { name: '黄色', value: '#eab308' },
  { name: '绿色', value: '#22c55e' },
  { name: '青色', value: '#06b6d4' },
  { name: '蓝色', value: '#3b82f6' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '粉色', value: '#ec4899' },
  { name: '靛蓝', value: '#6366f1' },
  { name: '灰蓝', value: '#64748b' },
  { name: '玫红', value: '#f43f5e' },
  { name: '琥珀', value: '#d97706' },
]

export const MOOD_OPTIONS = [
  { emoji: '😊', label: '开心' },
  { emoji: '😌', label: '平静' },
  { emoji: '💪', label: '充实' },
  { emoji: '😤', label: '努力' },
  { emoji: '😴', label: '疲惫' },
  { emoji: '😐', label: '一般' },
  { emoji: '😢', label: '难过' },
  { emoji: '🤩', label: '超棒' },
]

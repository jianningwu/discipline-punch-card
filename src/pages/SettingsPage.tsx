import { useEffect, useState } from 'react'
import {
  Settings, Sun, Moon, Palette, Clock, Monitor,
  Leaf, Waves, Sunrise, Sparkles, Check, Image,
  User, Shield, Info, Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'

const THEMES = [
  { id: 'light', name: '浅色模式', description: '明亮清爽的界面', icon: Sun, preview: 'bg-white' },
  { id: 'dark', name: '深色模式', description: '护眼舒适的暗色', icon: Moon, preview: 'bg-gray-800' },
  { id: 'forest', name: '森林绿', description: '自然清新的绿色', icon: Leaf, preview: 'bg-green-500' },
  { id: 'ocean', name: '海洋蓝', description: '宁静深邃的蓝色', icon: Waves, preview: 'bg-sky-500' },
  { id: 'sunset', name: '日落橙', description: '温暖活力的橙色', icon: Sunrise, preview: 'bg-orange-500' },
  { id: 'purple', name: '梦幻紫', description: '优雅神秘的紫色', icon: Sparkles, preview: 'bg-purple-500' },
]

const BACKGROUND_PATTERNS = [
  { id: 'default', name: '默认', type: 'gradient', preview: 'bg-gradient-to-br from-primary-50 to-purple-50' },
  { id: 'dots', name: '圆点', type: 'pattern', preview: 'bg-pattern-dots bg-white' },
  { id: 'grid', name: '网格', type: 'pattern', preview: 'bg-pattern-grid bg-white' },
  { id: 'waves', name: '波浪', type: 'pattern', preview: 'bg-pattern-waves' },
  { id: 'solid-light', name: '纯白', type: 'solid', preview: 'bg-white' },
  { id: 'solid-gray', name: '浅灰', type: 'solid', preview: 'bg-gray-50' },
]

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const { settings, loadSettings, updateSettings } = useSettingsStore()
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (user) loadSettings(user.id)
  }, [user, loadSettings])

  const handleThemeChange = async (themeId: string) => {
    if (!user) return
    setSaving('theme')
    await updateSettings(user.id, { theme: themeId })
    setSaving(null)
  }

  const handleBackgroundChange = async (bgId: string) => {
    if (!user) return
    setSaving('background')
    await updateSettings(user.id, {
      background_type: BACKGROUND_PATTERNS.find((b) => b.id === bgId)?.type || 'gradient',
      background_value: bgId,
    })
    setSaving(null)
  }

  const handleClockFormatChange = async (format: string) => {
    if (!user) return
    setSaving('clock')
    await updateSettings(user.id, { clock_format: format })
    setSaving(null)
  }

  const currentTheme = settings?.theme || 'light'
  const currentBg = settings?.background_value || 'default'
  const currentClockFormat = settings?.clock_format || '24h'

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary-500" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">设置</h2>
      </div>

      {/* Theme Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">主题切换</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {THEMES.map((theme) => {
            const isActive = currentTheme === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                disabled={saving === 'theme'}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`w-12 h-12 ${theme.preview} rounded-xl mb-2 shadow-sm border border-gray-200/50`} />
                <theme.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {theme.name}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">{theme.description}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Background Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">背景设置</h3>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {BACKGROUND_PATTERNS.map((bg) => {
            const isActive = currentBg === bg.id
            return (
              <button
                key={bg.id}
                onClick={() => handleBackgroundChange(bg.id)}
                disabled={saving === 'background'}
                className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? 'border-primary-500 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                {isActive && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <div className={`w-full h-10 ${bg.preview} rounded-lg mb-1.5 border border-gray-200/50 dark:border-gray-600/50`} />
                <span className={`text-xs ${isActive ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-500'}`}>
                  {bg.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Clock Format */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">时间格式</h3>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleClockFormatChange('24h')}
            disabled={saving === 'clock'}
            className={`px-5 py-3 rounded-xl border-2 transition-all duration-200 ${
              currentClockFormat === '24h'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            }`}
          >
            <span className="text-lg font-mono font-bold">14:30:00</span>
            <p className="text-xs mt-1">24小时制</p>
          </button>
          <button
            onClick={() => handleClockFormatChange('12h')}
            disabled={saving === 'clock'}
            className={`px-5 py-3 rounded-xl border-2 transition-all duration-200 ${
              currentClockFormat === '12h'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            }`}
          >
            <span className="text-lg font-mono font-bold">02:30:00 PM</span>
            <p className="text-xs mt-1">12小时制</p>
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">账号信息</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500">用户名</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.username}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500">注册时间</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">用户ID</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">{user?.id}</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">关于</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p>自律打卡 v1.0.0</p>
          <p>一款专业的习惯追踪与自律打卡应用</p>
          <p>帮助你建立良好习惯，坚持每一天，遇见更好的自己</p>
          <p className="text-xs mt-3 text-gray-400">© 2024 Discipline Punch Card. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

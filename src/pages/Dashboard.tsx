import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckSquare, TrendingUp, Target, Zap, Calendar,
  ChevronRight, Plus, Check, Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCheckInStore } from '@/stores/checkInStore'
import { useClock } from '@/hooks/useClock'
import type { CheckInItem } from '@/types'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const {
    items, todayRecords, stats,
    loadItems, loadTodayRecords, loadStats, createRecord, deleteRecord,
    isLoading,
  } = useCheckInStore()
  const navigate = useNavigate()
  const { greeting, dateString, dayOfWeek } = useClock('24h')
  const [checkingItems, setCheckingItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (user) {
      loadItems(user.id)
      loadTodayRecords(user.id)
      loadStats(user.id)
    }
  }, [user, loadItems, loadTodayRecords, loadStats])

  const today = new Date().toISOString().split('T')[0]

  const isCheckedToday = (itemId: number) =>
    todayRecords.some((r) => r.item_id === itemId)

  const getTodayRecord = (itemId: number) =>
    todayRecords.find((r) => r.item_id === itemId)

  const handleToggleCheck = async (item: CheckInItem) => {
    if (!user) return
    setCheckingItems((prev) => new Set(prev).add(item.id))

    if (isCheckedToday(item.id)) {
      const record = getTodayRecord(item.id)
      if (record) {
        await deleteRecord(record.id)
      }
    } else {
      await createRecord(user.id, {
        item_id: item.id,
        check_date: today,
      })
    }

    await loadTodayRecords(user.id)
    await loadStats(user.id)
    setCheckingItems((prev) => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })
  }

  const completionRate = stats && stats.totalItems > 0
    ? Math.round((stats.todayCompleted / stats.totalItems) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-br from-primary-500 to-purple-600 text-white border-0 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">{dateString} {dayOfWeek}</p>
            <h1 className="text-2xl font-bold mt-1">{greeting}，{user?.username}</h1>
            <p className="text-primary-100 mt-2 text-sm">
              {completionRate === 100
                ? '🎉 太棒了！今天已经完成全部打卡！'
                : completionRate > 0
                ? `💪 已坚持打卡 ${stats?.currentStreak || 0} 天，继续加油！`
                : '🌟 新的一天，从第一个打卡开始吧！'}
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="打卡项目"
          value={stats?.totalItems || 0}
          color="text-blue-500"
          bg="bg-blue-50 dark:bg-blue-500/10"
        />
        <StatCard
          icon={<CheckSquare className="w-5 h-5" />}
          label="今日完成"
          value={`${stats?.todayCompleted || 0}/${stats?.totalItems || 0}`}
          sub={`${completionRate}%`}
          color="text-green-500"
          bg="bg-green-50 dark:bg-green-500/10"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="当前连续"
          value={`${stats?.currentStreak || 0} 天`}
          color="text-orange-500"
          bg="bg-orange-50 dark:bg-orange-500/10"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="最长连续"
          value={`${stats?.longestStreak || 0} 天`}
          color="text-purple-500"
          bg="bg-purple-50 dark:bg-purple-500/10"
        />
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">今日进度</h3>
          <span className="text-sm font-bold text-primary-500">{completionRate}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Today's Check-in Items */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">今日打卡</h3>
          <button
            onClick={() => navigate('/check-in')}
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            详细打卡 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>还没有打卡项目</p>
            <button onClick={() => navigate('/items')} className="text-primary-500 text-sm mt-1 hover:underline">
              去添加项目
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map((item) => {
              const checked = isCheckedToday(item.id)
              const isChecking = checkingItems.has(item.id)
              const record = getTodayRecord(item.id)

              return (
                <button
                  key={item.id}
                  onClick={() => handleToggleCheck(item)}
                  disabled={isChecking}
                  className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    checked
                      ? 'border-green-300 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500/30 bg-white dark:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  {isChecking && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                    </div>
                  )}
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${checked ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-200'}`}>
                      {item.name}
                    </p>
                    {record?.content && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{record.content}</p>
                    )}
                  </div>
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      checked
                        ? 'bg-green-500 border-green-500 scale-100'
                        : 'border-gray-300 dark:border-gray-500 scale-100'
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5 text-white check-animate" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={() => navigate('/check-in')} className="btn-primary">
          <Plus className="w-4 h-4" />
          开始打卡
        </button>
        <button onClick={() => navigate('/calendar')} className="btn-secondary">
          <Calendar className="w-4 h-4" />
          查看日历
        </button>
        <button onClick={() => navigate('/statistics')} className="btn-secondary">
          <TrendingUp className="w-4 h-4" />
          查看统计
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color, bg }: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
  bg: string
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

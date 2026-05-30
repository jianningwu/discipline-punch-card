import { useEffect, useState, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, getDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useAuthStore } from '@/stores/authStore'
import { useCheckInStore } from '@/stores/checkInStore'
import { api } from '@/database/api'
import type { CalendarDataItem } from '@/types'

export default function CalendarPage() {
  const user = useAuthStore((s) => s.user)
  const { items } = useCheckInStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarDataItem[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth() + 1

  useEffect(() => {
    if (user) {
      loadCalendarData()
    }
  }, [user, year, month, viewMode])

  const loadCalendarData = async () => {
    if (!user) return
    if (viewMode === 'year') {
      const result = await api.getCalendarData(user.id, year)
      if (result.success) setCalendarData(result.data)
    } else {
      const result = await api.getCalendarData(user.id, year, month)
      if (result.success) setCalendarData(result.data)
    }
  }

  // Month view days
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const getDayData = (dateStr: string) =>
    calendarData.find((d) => d.check_date === dateStr)

  const getHeatmapClass = (count: number) => {
    if (count === 0) return 'heatmap-0'
    if (count <= 2) return 'heatmap-2'
    if (count <= 4) return 'heatmap-3'
    if (count <= 6) return 'heatmap-4'
    return 'heatmap-5'
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  // Year view - generate monthly summaries
  const yearMonths = useMemo(() => {
    const months: { month: number; days: number; completed: number; data: CalendarDataItem[] }[] = []
    for (let m = 1; m <= 12; m++) {
      const monthStr = `${year}-${String(m).padStart(2, '0')}`
      const monthData = calendarData.filter((d) => d.check_date.startsWith(monthStr))
      const daysInMonth = new Date(year, m, 0).getDate()
      months.push({
        month: m,
        days: daysInMonth,
        completed: new Set(monthData.map((d) => d.check_date)).size,
        data: monthData,
      })
    }
    return months
  }, [calendarData, year])

  const selectedDateData = selectedDate ? getDayData(selectedDate) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">打卡日历</h2>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              月视图
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'year'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              年视图
            </button>
          </div>
        </div>
      </div>

      {/* Month/Year Navigator */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentMonth((d) => subMonths(d, viewMode === 'year' ? 12 : 1))}
          className="btn-ghost p-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 min-w-[180px] text-center">
          {viewMode === 'year' ? `${year}年` : format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
        </h3>
        <button
          onClick={() => setCurrentMonth((d) => addMonths(d, viewMode === 'year' ? 12 : 1))}
          disabled={viewMode === 'month' && currentMonth >= startOfMonth(new Date())}
          className="btn-ghost p-2 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="card">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayData = getDayData(dateStr)
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200
                    ${!isCurrentMonth ? 'opacity-25' : ''}
                    ${isToday ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-gray-800' : ''}
                    ${isSelected ? 'ring-2 ring-blue-500 scale-105 shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                    ${dayData ? getHeatmapClass(dayData.count) : 'heatmap-0'}
                  `}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayData && (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(dayData.count, 5) }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-green-600 dark:bg-green-400" />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 justify-end text-xs text-gray-400">
            <span>少</span>
            <div className="w-3 h-3 rounded heatmap-0" />
            <div className="w-3 h-3 rounded heatmap-2" />
            <div className="w-3 h-3 rounded heatmap-3" />
            <div className="w-3 h-3 rounded heatmap-4" />
            <div className="w-3 h-3 rounded heatmap-5" />
            <span>多</span>
          </div>
        </div>
      )}

      {/* Year View */}
      {viewMode === 'year' && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {yearMonths.map((m) => {
            const rate = m.days > 0 ? Math.round((m.completed / m.days) * 100) : 0
            return (
              <button
                key={m.month}
                onClick={() => {
                  setCurrentMonth(new Date(year, m.month - 1, 1))
                  setViewMode('month')
                }}
                className="card hover:shadow-lg hover:scale-105 transition-all duration-200 text-left cursor-pointer"
              >
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {m.month}月
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {m.completed}
                  </span>
                  <span className="text-sm text-gray-400 mb-0.5">/ {m.days}天</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{rate}%</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected Date Detail */}
      {selectedDate && selectedDateData && (
        <div className="card animate-slide-up">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            {selectedDate} 打卡详情
          </h3>
          <p className="text-sm text-gray-500">
            完成 <span className="font-bold text-primary-500">{selectedDateData.count}</span> 项打卡
          </p>
          {selectedDateData.items && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {selectedDateData.items.split(',').map((idStr) => {
                const item = items.find((i) => i.id === parseInt(idStr))
                return item ? (
                  <span key={idStr} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                    {item.icon} {item.name}
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp, Target, Award, Zap, Calendar,
  BarChart3, Loader2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  Legend, AreaChart, Area,
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { useAuthStore } from '@/stores/authStore'
import { useCheckInStore } from '@/stores/checkInStore'
import { api } from '@/database/api'

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#64748b',
]

export default function StatisticsPage() {
  const user = useAuthStore((s) => s.user)
  const { items, stats, loadItems, loadStats } = useCheckInStore()
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [itemCompletions, setItemCompletions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadItems(user.id)
      loadStats(user.id)
      loadChartData()
    }
  }, [user])

  const loadChartData = async () => {
    if (!user) return
    setIsLoading(true)

    // Weekly data - last 7 days
    const weekData = []
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const dayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(date).getDay()]
      const result = await api.getRecordsByDate(user.id, date)
      weekData.push({
        date: dayName,
        fullDate: date,
        完成: result.success ? result.records.length : 0,
        总计: items.length,
      })
    }
    setWeeklyData(weekData)

    // Item completion stats - current month
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')

    const itemStats = await Promise.all(
      items.map(async (item) => {
        // Count records for this item in current month
        const result = await api.getCalendarData(user.id, new Date().getFullYear(), new Date().getMonth() + 1)
        let count = 0
        if (result.success) {
          count = result.data.filter((d: any) => {
            // Check if this item contributed to the day's count
            // This is approximate; we use the records directly via getRecordsByDate
            return d.count > 0
          }).length
        }

        // Better approach: count records for each item by checking daily records
        let itemCount = 0
        const days = result.success ? result.data : []
        for (const day of days) {
          const dayResult = await api.getRecordsByDate(user.id, day.check_date)
          if (dayResult.success) {
            if (dayResult.records.some((r: any) => r.item_id === item.id)) {
              itemCount++
            }
          }
        }

        return {
          name: item.name,
          icon: item.icon,
          count: itemCount,
          color: item.color,
        }
      })
    )

    setItemCompletions(itemStats.filter((s) => s.count > 0).sort((a, b) => b.count - a.count))
    setIsLoading(false)
  }

  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const currentDay = today.getDate()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary-500" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">数据统计</h2>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="今日完成率"
          value={`${stats ? Math.round((stats.todayCompleted / Math.max(stats.totalItems, 1)) * 100) : 0}%`}
          color="text-blue-500"
          bg="bg-blue-50 dark:bg-blue-500/10"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="当前连续打卡"
          value={`${stats?.currentStreak || 0} 天`}
          color="text-green-500"
          bg="bg-green-50 dark:bg-green-500/10"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="最长连续打卡"
          value={`${stats?.longestStreak || 0} 天`}
          color="text-orange-500"
          bg="bg-orange-50 dark:bg-orange-500/10"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="本月打卡天数"
          value={`${currentDay} / ${daysInMonth} 天`}
          color="text-purple-500"
          bg="bg-purple-50 dark:bg-purple-500/10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* Weekly Bar Chart */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">近7天打卡趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [`${value} 项`, '完成']}
                  labelFormatter={(label: string, payload: any) => payload?.[0]?.payload?.fullDate || label}
                />
                <Bar dataKey="完成" radius={[8, 8, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - Item Distribution */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">项目完成分布</h3>
              {itemCompletions.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={itemCompletions}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                    >
                      {itemCompletions.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number, _: string, props: any) => [
                        `${value} 天`,
                        `${props.payload.icon} ${props.payload.name}`,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>暂无本月打卡数据</p>
                  </div>
                </div>
              )}
            </div>

            {/* Line Chart - Weekly Trend */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">完成率变化</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorComplete" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, (dataMax: number) => dataMax + 2]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="完成"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#colorComplete)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Item Ranking */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">打卡项目排行</h3>
            <div className="space-y-3">
              {itemCompletions.map((item, idx) => {
                const maxCount = itemCompletions[0]?.count || 1
                const barWidth = (item.count / maxCount) * 100
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-6">{idx + 1}</span>
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 truncate">
                      {item.name}
                    </span>
                    <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: item.color || CHART_COLORS[idx % CHART_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
                      {item.count}天
                    </span>
                  </div>
                )
              })}
              {itemCompletions.length === 0 && (
                <p className="text-center text-gray-400 py-4">暂无数据</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode
  label: string
  value: string | number
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
      </div>
    </div>
  )
}

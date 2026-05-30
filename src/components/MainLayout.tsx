import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  ListTodo, Settings, LogOut, Menu, X, Clock, ChevronLeft,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useClock } from '@/hooks/useClock'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '首页' },
  { to: '/check-in', icon: CheckSquare, label: '打卡' },
  { to: '/calendar', icon: Calendar, label: '日历' },
  { to: '/statistics', icon: BarChart3, label: '统计' },
  { to: '/items', icon: ListTodo, label: '项目管理' },
  { to: '/settings', icon: Settings, label: '设置' },
]

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { timeString, greeting, dateString, dayOfWeek } = useClock('24h')

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-xl dark:shadow-2xl ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">自律打卡</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 font-semibold shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                } ${!sidebarOpen ? 'justify-center' : ''}`
              }
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${!sidebarOpen ? 'group-hover:scale-110 transition-transform' : ''}`} />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {sidebarOpen ? (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{greeting}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary-500" />
            <div>
              <span className="text-xl font-mono font-bold text-gray-800 dark:text-gray-200">{timeString}</span>
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{dateString} {dayOfWeek}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">{greeting}，{user?.username}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

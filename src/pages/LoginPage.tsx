import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { login, isLoading, error, clearError } = useAuthStore()

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!username.trim()) newErrors.username = '请输入用户名'
    if (!password) newErrors.password = '请输入密码'
    else if (password.length < 6) newErrors.password = '密码至少6位'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    if (!validate()) return
    await login(username.trim(), password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl shadow-lg shadow-primary-500/25 mb-4">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">自律打卡</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">坚持每一天，遇见更好的自己</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">欢迎回来</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-400 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: '' })) }}
                className={`input ${errors.username ? 'input-error' : ''}`}
                placeholder="请输入用户名"
                autoComplete="username"
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isLoading ? '登录中...' : '登 录'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            还没有账号？{' '}
            <Link to="/auth/register" className="text-primary-500 hover:text-primary-600 font-medium">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

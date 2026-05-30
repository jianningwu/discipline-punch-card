import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useSettingsStore } from './stores/settingsStore'
import { useEffect } from 'react'
import MainLayout from './components/MainLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import CheckInPage from './pages/CheckInPage'
import CalendarPage from './pages/CalendarPage'
import StatisticsPage from './pages/StatisticsPage'
import ItemsManagePage from './pages/ItemsManagePage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const loadSettings = useSettingsStore((s) => s.loadSettings)

  useEffect(() => {
    if (user) {
      loadSettings(user.id)
    }
  }, [user, loadSettings])

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Main App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="check-in" element={<CheckInPage />} />
        <Route path="check-in/:date" element={<CheckInPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="items" element={<ItemsManagePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/auth/login'} replace />} />
    </Routes>
  )
}

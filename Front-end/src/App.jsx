import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import EventsPage from './pages/events/EventsPage'
import Dashboard from './pages/dashboard/Dashboard'
import './App.css'

const STATS = [
  { icon: '🎟️', label: 'Upcoming events', value: '12', delta: '+3 this month' },
  { icon: '🧑‍🤝‍🧑', label: 'Total attendees', value: '1,284', delta: '+214 this week' },
  { icon: '💜', label: 'Revenue', value: '$24.6K', delta: '+8.2%' },
]

export function DashboardLegacy() {
  return (
    <AppShell>
      <section className="page-intro">
        <span className="page-intro__eyebrow">Welcome back 👋</span>
        <h2 className="page-intro__title">Your events, beautifully organized 🎉</h2>
        <p className="page-intro__text">
          This layout is powered by the new <code>Sidebar</code>, <code>Header</code> and{' '}
          <code>Footer</code> components — plug in your dashboard content here.
        </p>
      </section>

      <section className="stat-grid">
        {STATS.map((stat) => (
          <div className="stat-tile" key={stat.label}>
            <span className="stat-tile__icon" aria-hidden="true">
              {stat.icon}
            </span>
            <div className="stat-tile__body">
              <span className="stat-tile__label">{stat.label}</span>
              <span className="stat-tile__value">{stat.value}</span>
              <span className="stat-tile__delta">▲ {stat.delta}</span>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  )
}

function App() {
  const { initializing, isAuthenticated, isAdmin } = useAuth()

  if (initializing) {
    return <div className="app-loading">Loading…</div>
  }

  const homeRoute = isAdmin ? '/admin' : '/'

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <Register />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password/:uid/:token"
        element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <ResetPassword />}
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<EventsPage />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? homeRoute : '/login'} replace />} />
    </Routes>
  )
}

export default App

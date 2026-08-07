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
import './App.css'

function Dashboard() {
  return (
    <AppShell>
      <section className="page-intro">
        <span className="page-intro__eyebrow">Welcome back</span>
        <h2 className="page-intro__title">Your events, beautifully organized</h2>
        <p className="page-intro__text">
          This layout is powered by the new <code>Sidebar</code>, <code>Header</code> and{' '}
          <code>Footer</code> components — plug in your dashboard content here.
        </p>
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
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? homeRoute : '/login'} replace />} />
    </Routes>
  )
}

export default App

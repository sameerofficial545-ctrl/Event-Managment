import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { TOKEN_KEY } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setInitializing(false)
      return
    }
    api
      .get('/auth/me/')
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setInitializing(false))
  }, [token])

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login/', credentials)
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    // Deliberately doesn't store the token/log the user in - registration
    // hands back to the login page so the user enters their credentials
    // themselves, rather than silently starting an authenticated session.
    const { data } = await api.post('/auth/register/', payload)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(token),
      initializing,
      login,
      register,
      logout,
    }),
    [user, token, initializing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

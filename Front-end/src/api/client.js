import axios from 'axios'

export const TOKEN_KEY = 'eventify_token'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// A 401 means the token is missing, expired, or its session was revoked
// (e.g. logged out from another tab, or a password reset elsewhere) - drop
// it locally too and send the user back to log in, rather than letting the
// app sit in a half-authenticated state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

// Turns the backend's { error: { message, details } } envelope into
// something a form can render directly: field-level messages plus one
// general message for anything that isn't tied to a specific field.
export function parseApiError(error) {
  const payload = error?.response?.data?.error
  const message = payload?.message || error?.message || 'Something went wrong. Please try again.'
  const details = payload?.details

  const fieldErrors = {}
  const generalErrors = []

  if (details && typeof details === 'object' && !Array.isArray(details)) {
    Object.entries(details).forEach(([key, value]) => {
      const text = Array.isArray(value) ? value.join(' ') : String(value)
      if (key === 'non_field_errors' || key === 'detail') {
        generalErrors.push(text)
      } else {
        fieldErrors[key] = text
      }
    })
  }

  return {
    message,
    fieldErrors,
    generalError: generalErrors.length > 0 ? generalErrors.join(' ') : message,
  }
}

export default api

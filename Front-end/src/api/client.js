import axios from 'axios'

export const TOKEN_KEY = 'eventify_token'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

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

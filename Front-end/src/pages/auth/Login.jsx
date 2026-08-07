import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { parseApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'
import FormField from './FormField'
import './Auth.css'

const INITIAL_FORM = { username: '', password: '' }

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    username: location.state?.username || '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setGeneralError('')
    setFieldErrors({})

    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const parsed = parseApiError(error)
      setFieldErrors(parsed.fieldErrors)
      setGeneralError(parsed.generalError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your events."
      footer={
        <p>
          New to Eventify? <Link to="/register">Create an account</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {location.state?.registered && !generalError && (
          <p className="auth-form__success" role="status">
            Account created. Log in to continue.
          </p>
        )}
        {generalError && (
          <p className="auth-form__error" role="alert">
            {generalError}
          </p>
        )}

        <FormField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          error={fieldErrors.username}
          autoComplete="username"
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          autoComplete="current-password"
          required
        />

        <button type="submit" className="auth-form__submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login

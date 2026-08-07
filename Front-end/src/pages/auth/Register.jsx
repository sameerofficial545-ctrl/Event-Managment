import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { parseApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'
import FormField from './FormField'
import './Auth.css'

const INITIAL_FORM = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  password2: '',
}

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
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
    setGeneralError('')

    if (form.password !== form.password2) {
      setFieldErrors((prev) => ({ ...prev, password2: 'Passwords do not match.' }))
      return
    }
    setFieldErrors({})
    setSubmitting(true)

    try {
      await register(form)
      navigate('/', { replace: true })
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
      title="Create your account"
      subtitle="Start planning events in minutes."
      footer={
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {generalError && (
          <p className="auth-form__error" role="alert">
            {generalError}
          </p>
        )}

        <div className="auth-form__row">
          <FormField
            label="First name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            error={fieldErrors.first_name}
            autoComplete="given-name"
          />
          <FormField
            label="Last name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            error={fieldErrors.last_name}
            autoComplete="family-name"
          />
        </div>

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
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          autoComplete="email"
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          autoComplete="new-password"
          required
        />
        <FormField
          label="Confirm password"
          name="password2"
          type="password"
          value={form.password2}
          onChange={handleChange}
          error={fieldErrors.password2}
          autoComplete="new-password"
          required
        />

        <button type="submit" className="auth-form__submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register

import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { parseApiError } from '../../api/client'
import AuthLayout from './AuthLayout'
import FormField from '../../components/FormField'
import './Auth.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    setEmail(event.target.value)
    setFieldErrors((prev) => ({ ...prev, email: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setGeneralError('')
    setFieldErrors({})
    setSubmitting(true)

    try {
      await api.post('/auth/password-reset/', { email })
      setSubmitted(true)
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
      title="Reset your password 🔐"
      subtitle={submitted ? undefined : "Enter your account email and we'll send you a reset link."}
      footer={
        <p>
          Remembered it? <Link to="/login">Log in</Link>
        </p>
      }
    >
      {submitted ? (
        <p className="auth-form__success" role="status">
          If <strong>{email}</strong> is registered, a reset link is on its way — check your
          inbox (and spam folder).
        </p>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {generalError && (
            <p className="auth-form__error" role="alert">
              {generalError}
            </p>
          )}

          <FormField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={handleChange}
            error={fieldErrors.email}
            autoComplete="email"
            required
          />

          <button type="submit" className="auth-form__submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}

export default ForgotPassword

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { parseApiError } from '../../api/client'
import AuthLayout from './AuthLayout'
import FormField from './FormField'
import './Auth.css'

const INITIAL_FORM = { new_password: '', new_password2: '' }

function ResetPassword() {
  const { uid, token } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [linkInvalid, setLinkInvalid] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setGeneralError('')
    setLinkInvalid(false)

    if (form.new_password !== form.new_password2) {
      setFieldErrors({ new_password2: 'Passwords do not match.' })
      return
    }
    setFieldErrors({})
    setSubmitting(true)

    try {
      await api.post('/auth/password-reset-confirm/', { uid, token, ...form })
      setSucceeded(true)
    } catch (error) {
      const parsed = parseApiError(error)
      // uid/token errors don't map to a visible field, so surface them as
      // the banner instead of silently dropping them.
      const linkError = parsed.fieldErrors.uid || parsed.fieldErrors.token
      setFieldErrors({
        new_password: parsed.fieldErrors.new_password,
        new_password2: parsed.fieldErrors.new_password2,
      })
      setGeneralError(linkError || parsed.generalError)
      setLinkInvalid(Boolean(linkError))
    } finally {
      setSubmitting(false)
    }
  }

  if (succeeded) {
    return (
      <AuthLayout title="Password reset ✅" subtitle="Your password has been updated.">
        <p className="auth-form__success" role="status">
          You can now log in with your new password.
        </p>
        <button
          type="button"
          className="auth-form__submit"
          onClick={() => navigate('/login', { replace: true })}
        >
          Go to login
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Choose a new password 🔑"
      subtitle="Enter a new password for your account."
      footer={
        <p>
          <Link to="/login">Back to login</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {generalError && (
          <p className="auth-form__error" role="alert">
            {generalError}
            {linkInvalid && (
              <>
                {' '}
                <Link to="/forgot-password" className="auth-form__inline-link">
                  Request a new link
                </Link>
              </>
            )}
          </p>
        )}

        {!linkInvalid && (
          <>
            <FormField
              label="New password"
              name="new_password"
              type="password"
              value={form.new_password}
              onChange={handleChange}
              error={fieldErrors.new_password}
              autoComplete="new-password"
              required
            />
            <FormField
              label="Confirm new password"
              name="new_password2"
              type="password"
              value={form.new_password2}
              onChange={handleChange}
              error={fieldErrors.new_password2}
              autoComplete="new-password"
              required
            />

            <button type="submit" className="auth-form__submit" disabled={submitting}>
              {submitting ? 'Resetting…' : 'Reset password'}
            </button>
          </>
        )}
      </form>
    </AuthLayout>
  )
}

export default ResetPassword

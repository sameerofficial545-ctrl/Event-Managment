import { Link } from 'react-router-dom'
import { IconSparkle } from '../../components/icons'
import './AuthLayout.css'

function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__brand">
        <Link to="/" className="auth-shell__logo">
          <span className="auth-shell__logo-mark">
            <IconSparkle className="icon" />
          </span>
          <span>Eventify</span>
        </Link>

        <div className="auth-shell__pitch">
          <h2>Plan events people remember.</h2>
          <p>
            Manage guest lists, schedules and check-ins from one beautifully
            organized dashboard.
          </p>
        </div>

        <p className="auth-shell__quote">
          "Eventify cut our planning time in half."
          <span>— a happy organizer</span>
        </p>
      </aside>

      <main className="auth-shell__panel">
        <div className="auth-card">
          <h1>{title}</h1>
          {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
          {children}
          {footer && <div className="auth-card__footer">{footer}</div>}
        </div>
      </main>
    </div>
  )
}

export default AuthLayout

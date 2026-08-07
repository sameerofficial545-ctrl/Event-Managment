import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDisplayName, getInitials } from '../utils/user'
import {
  IconSparkle,
  IconDashboard,
  IconEvents,
  IconCalendar,
  IconUsers,
  IconSettings,
  IconLogOut,
  IconX,
} from './icons'
import './Sidebar.css'

const PLACEHOLDER_ITEMS = [
  { label: 'Events', icon: IconEvents, badge: 12 },
  { label: 'Calendar', icon: IconCalendar },
  { label: 'Attendees', icon: IconUsers },
  { label: 'Settings', icon: IconSettings },
]

const navLinkClass = ({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`

function Sidebar({ open, onClose }) {
  const [active, setActive] = useState(null)
  const { user, logout, isAdmin } = useAuth()

  return (
    <>
      <div
        className={`sidebar-scrim ${open ? 'sidebar-scrim--visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark">
            <IconSparkle className="icon" />
          </span>
          <span className="sidebar__brand-text">Eventify</span>
          <button
            type="button"
            className="sidebar__close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <IconX className="icon" />
          </button>
        </div>

        <nav className="sidebar__nav">
          <span className="sidebar__section-label">Main</span>
          <ul>
            <li>
              <NavLink to="/" end className={navLinkClass}>
                <IconDashboard className="icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            {PLACEHOLDER_ITEMS.map(({ label, icon: Icon, badge }) => (
              <li key={label}>
                <button
                  type="button"
                  className={`sidebar__link ${active === label ? 'sidebar__link--active' : ''}`}
                  onClick={() => setActive(label)}
                >
                  <Icon className="icon" />
                  <span>{label}</span>
                  {badge ? <span className="sidebar__badge">{badge}</span> : null}
                </button>
              </li>
            ))}
          </ul>

          {isAdmin && (
            <>
              <span className="sidebar__section-label">Admin</span>
              <ul>
                <li>
                  <NavLink to="/admin" className={navLinkClass}>
                    <IconUsers className="icon" />
                    <span>All users</span>
                  </NavLink>
                </li>
              </ul>
            </>
          )}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <span className="sidebar__avatar">{getInitials(user)}</span>
            <div className="sidebar__user-info">
              <strong>{getDisplayName(user)}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button type="button" className="sidebar__logout" onClick={logout} aria-label="Log out">
            <IconLogOut className="icon" />
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDisplayName, getInitials } from '../utils/user'
import ParticleField from './ParticleField'
import {
  IconSparkle,
  IconDashboard,
  IconEvents,
  IconUsers,
  IconLogOut,
  IconX,
  IconCalendar,
  IconHeart,
  IconChart,
} from './icons'
import './Sidebar.css'

const navLinkClass = ({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`

function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth()

  return (
    <>
      <div
        className={`sidebar-scrim ${open ? 'sidebar-scrim--visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <ParticleField variant="dark" density={35} />
        <div className="sidebar__content">
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
              <li>
                <NavLink to="/events" className={navLinkClass}>
                  <IconEvents className="icon" />
                  <span>Events</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/calendar" className={navLinkClass}>
                  <IconCalendar className="icon" />
                  <span>Calendar</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-plans" className={navLinkClass}>
                  <IconHeart className="icon" />
                  <span>My plans</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/insights" className={navLinkClass}>
                  <IconChart className="icon" />
                  <span>Insights</span>
                </NavLink>
              </li>
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
            <button
              type="button"
              className="sidebar__logout"
              onClick={logout}
              aria-label="Log out"
            >
              <IconLogOut className="icon" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

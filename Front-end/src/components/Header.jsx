import { useAuth } from '../context/AuthContext'
import { getDisplayName, getInitials } from '../utils/user'
import { IconMenu, IconSearch, IconBell, IconPlus } from './icons'
import './Header.css'

function Header({
  onMenuClick,
  eyebrow = 'Dashboard',
  title,
  searchPlaceholder = 'Search events, attendees...',
  ctaLabel = 'New event',
  showCta = true,
}) {
  const { user } = useAuth()

  return (
    <header className="header">
      <div className="header__left">
        <button
          type="button"
          className="header__menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <IconMenu className="icon" />
        </button>
        <div className="header__heading">
          <p className="header__eyebrow">{eyebrow}</p>
          <h1 className="header__title">{title || `Good morning, ${getDisplayName(user)}`}</h1>
        </div>
      </div>

      <div className="header__right">
        <label className="header__search">
          <IconSearch className="icon" />
          <input type="search" placeholder={searchPlaceholder} />
        </label>

        {showCta && (
          <button type="button" className="header__cta">
            <IconPlus className="icon" />
            <span>{ctaLabel}</span>
          </button>
        )}

        <button type="button" className="header__icon-btn" aria-label="Notifications">
          <IconBell className="icon" />
          <span className="header__dot" />
        </button>

        <div className="header__divider" />

        <button type="button" className="header__profile" aria-label="Open profile menu">
          <span className="header__avatar">{getInitials(user)}</span>
        </button>
      </div>
    </header>
  )
}

export default Header

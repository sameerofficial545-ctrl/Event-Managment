import { useState } from 'react'
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
  onCtaClick,
  onSearch,
}) {
  const { user, logout } = useAuth()
  const [panel, setPanel] = useState('')

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
          <input
            type="search"
            placeholder={searchPlaceholder}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && onSearch) onSearch(event.currentTarget.value.trim())
            }}
          />
        </label>

        {showCta && (
          <button type="button" className="header__cta" onClick={onCtaClick}>
            <IconPlus className="icon" />
            <span>{ctaLabel}</span>
          </button>
        )}

        <button type="button" className="header__icon-btn" aria-label="Notifications" aria-expanded={panel === 'notifications'} onClick={() => setPanel(panel === 'notifications' ? '' : 'notifications')}>
          <IconBell className="icon" />
        </button>

        <div className="header__divider" />

        <button type="button" className="header__profile" aria-label="Open profile menu" aria-expanded={panel === 'profile'} onClick={() => setPanel(panel === 'profile' ? '' : 'profile')}>
          <span className="header__avatar">{getInitials(user)}</span>
        </button>
        {panel && <div className="header-popover">
          {panel === 'notifications' ? <><span className="header-popover__kicker">Notifications</span><strong>You’re all caught up</strong><p>RSVP and guest updates will appear through email notifications.</p></> : <><span className="header-popover__kicker">Your account</span><strong>{getDisplayName(user)}</strong><p>{user?.email}</p><span className="header-popover__role">{user?.is_staff ? 'Administrator' : 'Attendee'}</span><button type="button" onClick={logout}>Log out</button></>}
        </div>}
      </div>
    </header>
  )
}

export default Header

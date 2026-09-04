import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { parseApiError } from '../../api/client'
import AppShell from '../../components/AppShell'
import { useAuth } from '../../context/AuthContext'
import { getDisplayName } from '../../utils/user'
import { IconArrowRight, IconCalendar, IconChart, IconClock, IconCompass, IconMapPin, IconPlus, IconUsers } from '../../components/icons'
import './Dashboard.css'

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
const formatTime = (value) => new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/events/').then(({ data }) => setEvents(data)).catch((requestError) => setError(parseApiError(requestError).message)).finally(() => setLoading(false))
  }, [])

  const insights = useMemo(() => {
    const now = Date.now()
    const upcoming = events.filter((event) => new Date(event.start_time).getTime() >= now).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    return { upcoming, mine: events.filter((event) => event.is_mine), locations: new Set(events.map((event) => event.location).filter(Boolean)) }
  }, [events])

  return (
    <AppShell headerProps={{ eyebrow: 'Overview', title: `Welcome back, ${getDisplayName(user)}`, searchPlaceholder: 'Find an event...', onSearch: (query) => navigate(`/events?search=${encodeURIComponent(query)}`), onCtaClick: () => navigate('/events?create=1') }}>
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-hero__eyebrow">✦ Make moments matter</span>
          <h2>Plan less. Celebrate more.</h2>
          <p>Everything you need to discover, organize, and grow memorable events in one place.</p>
          <div className="dashboard-hero__actions">
            <button type="button" className="primary-action" onClick={() => navigate('/events?create=1')}><IconPlus className="icon" /> Create an event</button>
            <Link className="secondary-action" to="/events">Explore events <IconArrowRight className="icon" /></Link>
          </div>
        </div>
        <div className="dashboard-hero__orb" aria-hidden="true"><IconCalendar className="icon" /><span>{insights.upcoming.length}</span><small>coming up</small></div>
      </section>
      {error && <div className="dashboard-alert" role="alert">{error}</div>}
      <section className="metric-grid" aria-label="Event overview">
        {[
          { label: 'Upcoming events', value: insights.upcoming.length, icon: IconCalendar, tone: 'violet' },
          { label: 'Events you organize', value: insights.mine.length, icon: IconChart, tone: 'blue' },
          { label: 'Places to explore', value: insights.locations.size, icon: IconCompass, tone: 'orange' },
          { label: 'All events', value: events.length, icon: IconUsers, tone: 'green' },
        ].map(({ label, value, icon: Icon, tone }) => <article className="metric-card" key={label}><span className={`metric-card__icon metric-card__icon--${tone}`}><Icon className="icon" /></span><div><strong>{loading ? '—' : value}</strong><span>{label}</span></div></article>)}
      </section>
      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel__head"><div><span className="section-kicker">Your schedule</span><h3>Next up</h3></div><Link to="/events">View all <IconArrowRight className="icon" /></Link></div>
          {loading ? <div className="dashboard-skeleton" aria-label="Loading events" /> : insights.upcoming.length ? <div className="agenda-list">{insights.upcoming.slice(0, 4).map((event, index) => <Link className="agenda-item" to={`/events?event=${event.id}`} key={event.id}><time><strong>{formatDate(event.start_time).split(' ')[1]}</strong><span>{formatDate(event.start_time).split(' ')[0]}</span></time><span className={`agenda-item__line agenda-item__line--${(index % 3) + 1}`} /><div className="agenda-item__body"><strong>{event.title}</strong><span><IconClock className="icon" /> {formatTime(event.start_time)}</span><span><IconMapPin className="icon" /> {event.location || 'Location to be announced'}</span></div><IconArrowRight className="agenda-item__arrow" /></Link>)}</div> : <div className="dashboard-empty"><IconCalendar className="icon" /><strong>Your calendar is clear</strong><span>Create an event or explore what others are hosting.</span></div>}
        </div>
        <aside className="dashboard-panel dashboard-panel--tips"><span className="section-kicker">Organizer toolkit</span><h3>Ready for your next event?</h3><p>Start with the essentials and make your event easy to discover.</p><ul><li><span>1</span>Add a clear title and story</li><li><span>2</span>Choose the right date and place</li><li><span>3</span>Invite guests and track responses</li></ul><button type="button" onClick={() => navigate('/events?create=1')}>Start planning <IconArrowRight className="icon" /></button></aside>
      </section>
    </AppShell>
  )
}

export default Dashboard

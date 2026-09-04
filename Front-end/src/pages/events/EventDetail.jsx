import { useEffect, useMemo, useState } from 'react'
import api, { parseApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { IconCalendar, IconCheck, IconMapPin, IconUsers, IconX } from '../../components/icons'

const LABELS = { going: 'Going', maybe: 'Maybe', not_going: 'Can’t go' }

function EventDetail({ event, onClose, onEdit, onGuests }) {
  const { user } = useAuth()
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose()
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', handleKey)
    api.get(`/events/${event.id}/rsvps/`).then(({ data }) => setRsvps(data)).catch((e) => setError(parseApiError(e).message)).finally(() => setLoading(false))
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', handleKey) }
  }, [event.id, onClose])

  const mine = rsvps.find((rsvp) => rsvp.user === user?.username)
  const counts = useMemo(() => rsvps.reduce((result, item) => ({ ...result, [item.status]: (result[item.status] || 0) + 1 }), {}), [rsvps])

  const respond = async (status) => {
    setSaving(status); setError('')
    try {
      const { data } = await api.post(`/events/${event.id}/rsvps/`, { status })
      setRsvps((current) => [...current.filter((item) => item.user !== user?.username), data])
    } catch (e) { setError(parseApiError(e).message) } finally { setSaving('') }
  }

  const start = new Date(event.start_time)
  const end = event.end_time ? new Date(event.end_time) : null
  const dateLabel = start.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const timeLabel = `${start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}${end ? ` – ${end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : ''}`

  return (
    <div className="event-modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article className="event-detail" role="dialog" aria-modal="true" aria-labelledby="event-detail-title">
        <div className="event-detail__cover"><span>{start.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span><strong>{start.getDate()}</strong><button type="button" onClick={onClose} aria-label="Close event details"><IconX className="icon" /></button></div>
        <div className="event-detail__content">
          <span className="event-detail__type">{event.is_mine ? 'Your event' : 'Community event'}</span>
          <h2 id="event-detail-title">{event.title}</h2>
          <p className="event-detail__organizer">Hosted by <strong>{event.is_mine ? 'you' : event.organizer}</strong></p>
          <div className="event-detail__facts">
            <div><IconCalendar className="icon" /><span><strong>{dateLabel}</strong><small>{timeLabel}</small></span></div>
            <div><IconMapPin className="icon" /><span><strong>{event.location || 'Location to be announced'}</strong><small>Event location</small></span></div>
            <div><IconUsers className="icon" /><span><strong>{event.is_mine ? `${counts.going || 0} going` : 'Open invitation'}</strong><small>{event.is_mine ? `${counts.maybe || 0} maybe · ${counts.not_going || 0} declined` : 'RSVP below'}</small></span></div>
          </div>
          <div className="event-detail__about"><h3>About this event</h3><p>{event.description || 'The organizer has not added a description yet.'}</p></div>
          {error && <p className="event-detail__error" role="alert">{error}</p>}
          <div className="event-detail__rsvp"><div><span className="section-kicker">Your response</span><strong>{loading ? 'Loading your RSVP…' : mine ? LABELS[mine.status] : 'Will you be there?'}</strong></div><div className="event-detail__choices">{Object.entries(LABELS).map(([status, label]) => <button type="button" key={status} className={mine?.status === status ? 'is-active' : ''} disabled={Boolean(saving)} onClick={() => respond(status)}>{mine?.status === status && <IconCheck className="icon" />}{saving === status ? 'Saving…' : label}</button>)}</div></div>
          {event.is_mine && <div className="event-detail__manage"><button type="button" onClick={() => onEdit(event)}>Edit event</button><button type="button" onClick={() => onGuests(event)}>Manage guests</button></div>}
        </div>
      </article>
    </div>
  )
}

export default EventDetail

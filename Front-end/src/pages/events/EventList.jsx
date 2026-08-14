import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUsers,
} from '../../components/icons'
import './Events.css'

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatTimeOnly(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function formatRange(event) {
  const startLabel = formatDateTime(event.start_time)
  if (!event.end_time) return startLabel

  const start = new Date(event.start_time)
  const end = new Date(event.end_time)
  const sameDay = start.toDateString() === end.toDateString()
  return sameDay
    ? `${startLabel} – ${formatTimeOnly(event.end_time)}`
    : `${startLabel} – ${formatDateTime(event.end_time)}`
}

function EventList({ events, onEdit, onDelete, onCreate }) {
  if (events.length === 0) {
    return (
      <div className="event-empty">
        <span className="event-empty__icon" aria-hidden="true">
          <IconCalendar className="icon" />
        </span>
        <h3>No events yet</h3>
        <p>Be the first to create one - everyone will be able to see and RSVP to it.</p>
        <button type="button" className="event-form__submit" onClick={onCreate}>
          <IconPlus className="icon" />
          <span>New event</span>
        </button>
      </div>
    )
  }

  return (
    <div className="event-grid">
      {events.map((event) => (
        <article className="event-card" key={event.id}>
          <div className="event-card__head">
            <h3>{event.title}</h3>
            {event.is_mine ? (
              <div className="event-card__actions">
                <button
                  type="button"
                  onClick={() => onEdit(event)}
                  aria-label={`Edit ${event.title}`}
                >
                  <IconPencil className="icon" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(event)}
                  aria-label={`Delete ${event.title}`}
                >
                  <IconTrash className="icon" />
                </button>
              </div>
            ) : (
              <span className="event-card__badge">Not yours</span>
            )}
          </div>

          <p className="event-card__meta">
            <IconClock className="icon" />
            <span>{formatRange(event)}</span>
          </p>

          <p className="event-card__meta">
            <IconUsers className="icon" />
            <span>{event.is_mine ? 'Organized by you' : `Organized by ${event.organizer}`}</span>
          </p>

          {event.location && (
            <p className="event-card__meta">
              <IconMapPin className="icon" />
              <span>{event.location}</span>
            </p>
          )}

          {event.description && <p className="event-card__desc">{event.description}</p>}
        </article>
      ))}
    </div>
  )
}

export default EventList

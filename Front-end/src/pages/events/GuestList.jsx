import { useCallback, useEffect, useState } from 'react'
import api, { parseApiError } from '../../api/client'
import FormField from '../../components/FormField'
import { IconMail, IconTrash, IconUserPlus, IconUsers } from '../../components/icons'
import './Events.css'

const EMPTY_GUEST = { name: '', email: '', notes: '' }

const STATUS_OPTIONS = [
  { key: 'invited', label: 'Invited' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'declined', label: 'Declined' },
]

const RSVP_LABELS = {
  going: 'Going',
  maybe: 'Maybe',
  not_going: 'Not going',
}

function GuestList({ event, onBack }) {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [attendees, setAttendees] = useState([])
  const [attendeesLoading, setAttendeesLoading] = useState(true)

  const [form, setForm] = useState(EMPTY_GUEST)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const loadGuests = useCallback(() => {
    setLoading(true)
    setError('')
    return api
      .get(`/events/${event.id}/guests/`)
      .then(({ data }) => setGuests(data))
      .catch((requestError) => setError(parseApiError(requestError).message))
      .finally(() => setLoading(false))
  }, [event.id])

  const loadAttendees = useCallback(() => {
    setAttendeesLoading(true)
    return api
      .get(`/events/${event.id}/rsvps/`)
      .then(({ data }) => setAttendees(data))
      .catch((requestError) => setError(parseApiError(requestError).message))
      .finally(() => setAttendeesLoading(false))
  }, [event.id])

  useEffect(() => {
    loadGuests()
    loadAttendees()
  }, [loadGuests, loadAttendees])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleAddGuest = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    try {
      await api.post(`/events/${event.id}/guests/`, form)
      setForm(EMPTY_GUEST)
      loadGuests()
    } catch (requestError) {
      setFieldErrors(parseApiError(requestError).fieldErrors)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (guest, status) => {
    setGuests((prev) => prev.map((g) => (g.id === guest.id ? { ...g, status } : g)))
    try {
      await api.patch(`/events/${event.id}/guests/${guest.id}/`, { status })
    } catch (requestError) {
      setError(parseApiError(requestError).message)
      loadGuests()
    }
  }

  const handleRemove = async (guest) => {
    if (!window.confirm(`Remove ${guest.name} from the guest list?`)) return
    try {
      await api.delete(`/events/${event.id}/guests/${guest.id}/`)
      setGuests((prev) => prev.filter((g) => g.id !== guest.id))
    } catch (requestError) {
      setError(parseApiError(requestError).message)
    }
  }

  const confirmedCount = guests.filter((g) => g.status === 'confirmed').length
  const goingCount = attendees.filter((a) => a.status === 'going').length

  return (
    <div className="guest-list">
      <section className="page-intro">
        <span className="page-intro__eyebrow">Guest list & attendees 👥</span>
        <h2 className="page-intro__title">{event.title}</h2>
        <p className="page-intro__text">
          {goingCount} attendee{goingCount === 1 ? '' : 's'} RSVP'd going · {confirmedCount} of{' '}
          {guests.length} invited guest{guests.length === 1 ? '' : 's'} confirmed.
        </p>
      </section>

      {error && <p className="events-error">{error}</p>}

      <h3 className="guest-list__section-title">Attendees (RSVP'd)</h3>

      {attendeesLoading ? (
        <p className="events-status">Loading attendees…</p>
      ) : attendees.length === 0 ? (
        <div className="event-empty event-empty--compact">
          <p>No one has RSVP'd yet.</p>
        </div>
      ) : (
        <ul className="guest-table">
          {attendees.map((attendee) => (
            <li className="guest-row" key={attendee.id}>
              <div className="guest-row__info">
                <strong>{attendee.user}</strong>
              </div>
              <span
                className={`guest-row__badge guest-row__badge--${attendee.status}`}
              >
                {RSVP_LABELS[attendee.status] || attendee.status}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="guest-list__section-title">Invited guests</h3>

      <form className="guest-form" onSubmit={handleAddGuest} noValidate>
        <div className="guest-form__row">
          <FormField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="e.g. Priya Sharma"
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="e.g. priya@example.com"
            required
          />
        </div>
        <FormField
          label="Notes (optional)"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          error={fieldErrors.notes}
          placeholder="e.g. Plus one, dietary restrictions..."
        />
        <div className="guest-form__actions">
          <button type="submit" className="event-form__submit" disabled={submitting}>
            <IconUserPlus className="icon" />
            <span>{submitting ? 'Adding…' : 'Add guest'}</span>
          </button>
        </div>
      </form>

      {loading ? (
        <p className="events-status">Loading guests…</p>
      ) : guests.length === 0 ? (
        <div className="event-empty">
          <span className="event-empty__icon" aria-hidden="true">
            <IconUsers className="icon" />
          </span>
          <h3>No guests yet</h3>
          <p>Add a name and email above to start building the invite list.</p>
        </div>
      ) : (
        <ul className="guest-table">
          {guests.map((guest) => (
            <li className="guest-row" key={guest.id}>
              <div className="guest-row__info">
                <strong>{guest.name}</strong>
                <span className="guest-row__email">
                  <IconMail className="icon" />
                  {guest.email}
                </span>
                {guest.notes && <span className="guest-row__notes">{guest.notes}</span>}
              </div>

              <div className="guest-row__status" role="group" aria-label={`Status for ${guest.name}`}>
                {STATUS_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    className={`guest-row__chip guest-row__chip--${key} ${guest.status === key ? 'guest-row__chip--active' : ''}`}
                    onClick={() => handleStatusChange(guest, key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="guest-row__remove"
                onClick={() => handleRemove(guest)}
                aria-label={`Remove ${guest.name}`}
              >
                <IconTrash className="icon" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="event-form__actions">
        <button type="button" className="event-form__cancel" onClick={onBack}>
          Back to events
        </button>
      </div>
    </div>
  )
}

export default GuestList

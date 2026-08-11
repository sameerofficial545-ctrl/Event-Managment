import { useState } from 'react'
import api, { parseApiError } from '../../api/client'
import FormField from '../../components/FormField'
import './Events.css'

const EMPTY_FORM = {
  title: '',
  location: '',
  start_time: '',
  end_time: '',
  description: '',
}

// <input type="datetime-local"> works in the browser's local wall-clock
// time, with no timezone info. These two helpers do the round-trip: turn
// the API's UTC ISO string into what the input should display, and turn
// the input's local value back into a correct UTC ISO string to send -
// `new Date(...)` treats an offset-less "YYYY-MM-DDTHH:mm" string as
// local time, which is exactly the conversion needed both ways.
function toDatetimeLocalValue(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIsoOrNull(localValue) {
  return localValue ? new Date(localValue).toISOString() : null
}

function EventForm({ event, onSaved, onCancel }) {
  const isEditing = Boolean(event)

  const [form, setForm] = useState(() =>
    event
      ? {
          title: event.title,
          location: event.location,
          start_time: toDatetimeLocalValue(event.start_time),
          end_time: toDatetimeLocalValue(event.end_time),
          description: event.description,
        }
      : EMPTY_FORM,
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event_) => {
    const { name, value } = event_.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (event_) => {
    event_.preventDefault()
    setGeneralError('')
    setFieldErrors({})
    setSubmitting(true)

    const payload = {
      title: form.title,
      location: form.location,
      description: form.description,
      start_time: toIsoOrNull(form.start_time),
      end_time: toIsoOrNull(form.end_time),
    }

    try {
      if (isEditing) {
        await api.patch(`/events/${event.id}/`, payload)
      } else {
        await api.post('/events/', payload)
      }
      onSaved()
    } catch (error) {
      const parsed = parseApiError(error)
      setFieldErrors(parsed.fieldErrors)
      setGeneralError(parsed.generalError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="event-form" onSubmit={handleSubmit} noValidate>
      {generalError && (
        <p className="event-form__error" role="alert">
          {generalError}
        </p>
      )}

      <FormField
        label="Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        error={fieldErrors.title}
        placeholder="e.g. Product launch party"
        required
      />

      <FormField
        label="Location"
        name="location"
        value={form.location}
        onChange={handleChange}
        error={fieldErrors.location}
        placeholder="e.g. Conference Hall A, or a video call link"
      />

      <div className="event-form__row">
        <FormField
          label="Starts"
          name="start_time"
          type="datetime-local"
          value={form.start_time}
          onChange={handleChange}
          error={fieldErrors.start_time}
          required
        />
        <FormField
          label="Ends"
          name="end_time"
          type="datetime-local"
          value={form.end_time}
          onChange={handleChange}
          error={fieldErrors.end_time}
        />
      </div>

      <FormField
        label="Description"
        name="description"
        as="textarea"
        rows={4}
        value={form.description}
        onChange={handleChange}
        error={fieldErrors.description}
        placeholder="What's this event about?"
      />

      <div className="event-form__actions">
        <button type="button" className="event-form__cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="event-form__submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create event'}
        </button>
      </div>
    </form>
  )
}

export default EventForm

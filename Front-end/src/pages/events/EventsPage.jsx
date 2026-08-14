import { useCallback, useEffect, useMemo, useState } from 'react'
import api, { parseApiError } from '../../api/client'
import AppShell from '../../components/AppShell'
import EventFilters, { DEFAULT_FILTERS } from './EventFilters'
import EventForm from './EventForm'
import EventList from './EventList'
import './Events.css'

function toLocalDateKey(isoString) {
  const date = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('list') // 'list' | 'form'
  const [editingEvent, setEditingEvent] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const loadEvents = useCallback(() => {
    setLoading(true)
    setError('')
    return api
      .get('/events/')
      .then(({ data }) => setEvents(data))
      .catch((requestError) => setError(parseApiError(requestError).message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const filteredEvents = useMemo(() => {
    const now = new Date()
    return events.filter((event) => {
      const start = new Date(event.start_time)
      if (filters.range === 'upcoming' && start < now) return false
      if (filters.range === 'past' && start >= now) return false
      if (filters.date && toLocalDateKey(event.start_time) !== filters.date) return false
      if (filters.location.trim()) {
        const needle = filters.location.trim().toLowerCase()
        if (!event.location?.toLowerCase().includes(needle)) return false
      }
      return true
    })
  }, [events, filters])

  const handleCreateClick = () => {
    setEditingEvent(null)
    setView('form')
  }

  const handleEditClick = (event) => {
    setEditingEvent(event)
    setView('form')
  }

  const handleCancel = () => {
    setView('list')
    setEditingEvent(null)
  }

  const handleSaved = () => {
    setView('list')
    setEditingEvent(null)
    loadEvents()
  }

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? This can't be undone.`)) return
    try {
      await api.delete(`/events/${event.id}/`)
      loadEvents()
    } catch (requestError) {
      setError(parseApiError(requestError).message)
    }
  }

  const hasNoMatches = !loading && events.length > 0 && filteredEvents.length === 0

  return (
    <AppShell
      headerProps={{
        eyebrow: 'Events',
        title: view === 'form' ? (editingEvent ? 'Edit event' : 'New event') : 'Events',
        searchPlaceholder: 'Search events...',
        showCta: view === 'list',
        onCtaClick: handleCreateClick,
      }}
    >
      {view === 'form' ? (
        <EventForm event={editingEvent} onSaved={handleSaved} onCancel={handleCancel} />
      ) : (
        <>
          <section className="page-intro">
            <span className="page-intro__eyebrow">Event management 🗓️</span>
            <h2 className="page-intro__title">Events</h2>
            <p className="page-intro__text">
              Browse every event, and create, edit, or remove the ones you're organizing.
            </p>
          </section>

          {error && <p className="events-error">{error}</p>}

          {!loading && events.length > 0 && (
            <EventFilters filters={filters} onChange={setFilters} />
          )}

          {loading ? (
            <p className="events-status">Loading events…</p>
          ) : hasNoMatches ? (
            <div className="event-empty">
              <h3>No events match your filters</h3>
              <p>Try a different date, location, or time range.</p>
              <button
                type="button"
                className="event-form__cancel"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <EventList
              events={filteredEvents}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onCreate={handleCreateClick}
            />
          )}
        </>
      )}
    </AppShell>
  )
}

export default EventsPage

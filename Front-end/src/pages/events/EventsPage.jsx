import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { parseApiError } from '../../api/client'
import AppShell from '../../components/AppShell'
import EventFilters, { DEFAULT_FILTERS } from './EventFilters'
import EventForm from './EventForm'
import EventList from './EventList'
import GuestList from './GuestList'
import EventDetail from './EventDetail'
import './Events.css'
import './EventsEnhancements.css'

function toLocalDateKey(isoString) {
  const date = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('list') // 'list' | 'form' | 'guests'
  const [editingEvent, setEditingEvent] = useState(null)
  const [guestEvent, setGuestEvent] = useState(null)
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS, search: searchParams.get('search') || '' }))
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [sort, setSort] = useState('soonest')
  const [layout, setLayout] = useState('grid')
  const [page, setPage] = useState(1)

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

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setEditingEvent(null)
      setView('form')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const eventId = searchParams.get('event')
    if (eventId && events.length) setSelectedEvent(events.find((event) => String(event.id) === eventId) || null)
  }, [events, searchParams])

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
      if (filters.search.trim()) {
        const needle = filters.search.trim().toLowerCase()
        if (![event.title, event.description, event.location, event.organizer].some((value) => value?.toLowerCase().includes(needle))) return false
      }
      return true
    })
  }, [events, filters])

  const sortedEvents = useMemo(() => [...filteredEvents].sort((a, b) => {
    if (sort === 'latest') return new Date(b.start_time) - new Date(a.start_time)
    if (sort === 'title') return a.title.localeCompare(b.title)
    return new Date(a.start_time) - new Date(b.start_time)
  }), [filteredEvents, sort])
  const pageCount = Math.max(1, Math.ceil(sortedEvents.length / 6))
  const visibleEvents = sortedEvents.slice((page - 1) * 6, page * 6)

  useEffect(() => setPage(1), [filters, sort])

  const handleCreateClick = () => {
    setEditingEvent(null)
    setView('form')
  }

  const handleEditClick = (event) => {
    setSelectedEvent(null)
    setEditingEvent(event)
    setView('form')
  }

  const handleCancel = () => {
    setView('list')
    setEditingEvent(null)
  }

  const handleGuestsClick = (event) => {
    setSelectedEvent(null)
    setGuestEvent(event)
    setView('guests')
  }

  const handleGuestsBack = () => {
    setView('list')
    setGuestEvent(null)
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
        title:
          view === 'form'
            ? editingEvent
              ? 'Edit event'
              : 'New event'
            : view === 'guests'
              ? 'Guest list'
              : 'Events',
        searchPlaceholder: 'Search events...',
        showCta: view === 'list',
        onCtaClick: handleCreateClick,
        onSearch: (search) => setFilters((current) => ({ ...current, search })),
      }}
    >
      {view === 'form' ? (
        <EventForm event={editingEvent} onSaved={handleSaved} onCancel={handleCancel} />
      ) : view === 'guests' ? (
        <GuestList event={guestEvent} onBack={handleGuestsBack} />
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

          {!loading && filteredEvents.length > 0 && (
            <div className="events-toolbar">
              <span><strong>{filteredEvents.length}</strong> event{filteredEvents.length === 1 ? '' : 's'} found</span>
              <div className="events-toolbar__controls">
                <label>Sort <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="soonest">Soonest first</option><option value="latest">Latest first</option><option value="title">A to Z</option></select></label>
                <div className="layout-toggle" aria-label="Event layout">
                  <button type="button" className={layout === 'grid' ? 'is-active' : ''} onClick={() => setLayout('grid')} aria-label="Grid view">▦</button>
                  <button type="button" className={layout === 'list' ? 'is-active' : ''} onClick={() => setLayout('list')} aria-label="List view">☰</button>
                </div>
              </div>
            </div>
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
              events={visibleEvents}
              layout={layout}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onCreate={handleCreateClick}
              onGuests={handleGuestsClick}
              onSelect={(event) => { setSelectedEvent(event); setSearchParams({ event: String(event.id) }) }}
            />
          )}
          {!loading && pageCount > 1 && (
            <nav className="pagination" aria-label="Event pages">
              <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>Next</button>
            </nav>
          )}
          {selectedEvent && <EventDetail event={selectedEvent} onClose={() => { setSelectedEvent(null); setSearchParams({}) }} onEdit={handleEditClick} onGuests={handleGuestsClick} />}
        </>
      )}
    </AppShell>
  )
}

export default EventsPage

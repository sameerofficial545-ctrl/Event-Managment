import { useCallback, useEffect, useState } from 'react'
import api, { parseApiError } from '../../api/client'
import AppShell from '../../components/AppShell'
import EventForm from './EventForm'
import EventList from './EventList'
import './Events.css'

function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('list') // 'list' | 'form'
  const [editingEvent, setEditingEvent] = useState(null)

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

  return (
    <AppShell
      headerProps={{
        eyebrow: 'Events',
        title: view === 'form' ? (editingEvent ? 'Edit event' : 'New event') : 'Your events',
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
            <h2 className="page-intro__title">Your events</h2>
            <p className="page-intro__text">
              Create, edit, and remove the events you're organizing.
            </p>
          </section>

          {error && <p className="events-error">{error}</p>}

          {loading ? (
            <p className="events-status">Loading events…</p>
          ) : (
            <EventList
              events={events}
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

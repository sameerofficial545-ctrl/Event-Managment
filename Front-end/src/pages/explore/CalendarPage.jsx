import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { parseApiError } from '../../api/client'
import AppShell from '../../components/AppShell'
import { IconArrowRight, IconCalendar, IconChevronRight, IconClock, IconMapPin } from '../../components/icons'
import './ProductPages.css'

const keyFor = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

function CalendarPage() {
  const [events, setEvents] = useState([])
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState(() => new Date())
  const [error, setError] = useState('')

  useEffect(() => { api.get('/events/').then(({ data }) => setEvents(data)).catch((e) => setError(parseApiError(e).message)) }, [])
  const byDay = useMemo(() => events.reduce((map, event) => { const key = keyFor(new Date(event.start_time)); map[key] = [...(map[key] || []), event]; return map }, {}), [events])
  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const start = new Date(first); start.setDate(1 - first.getDay())
    return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date })
  }, [cursor])
  const chosenEvents = byDay[keyFor(selected)] || []
  const move = (amount) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + amount, 1))

  return <AppShell headerProps={{ eyebrow: 'Plan', title: 'Event calendar', showCta: false }}>
    <section className="product-hero product-hero--calendar"><div><span>Visual planning</span><h2>See your month at a glance.</h2><p>Spot busy days, upcoming experiences, and open space for your next idea.</p></div><IconCalendar className="product-hero__icon" /></section>
    {error && <p className="product-error">{error}</p>}
    <section className="calendar-layout">
      <div className="calendar-card">
        <div className="calendar-toolbar"><button onClick={() => move(-1)} aria-label="Previous month"><IconChevronRight className="flip" /></button><h3>{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3><button onClick={() => move(1)} aria-label="Next month"><IconChevronRight /></button></div>
        <div className="calendar-weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">{cells.map((date) => { const items = byDay[keyFor(date)] || []; const active = keyFor(date) === keyFor(selected); return <button type="button" key={date.toISOString()} className={`${date.getMonth() !== cursor.getMonth() ? 'is-muted' : ''} ${active ? 'is-selected' : ''}`} onClick={() => setSelected(date)}><span>{date.getDate()}</span>{items.slice(0,3).map((event, index) => <i key={event.id} className={`dot dot--${index + 1}`} title={event.title} />)}{items.length > 3 && <small>+{items.length - 3}</small>}</button> })}</div>
      </div>
      <aside className="day-agenda"><span className="section-kicker">Selected day</span><h3>{selected.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>{chosenEvents.length ? chosenEvents.map((event) => <Link to={`/events?event=${event.id}`} className="day-event" key={event.id}><strong>{event.title}</strong><span><IconClock />{new Date(event.start_time).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</span><span><IconMapPin />{event.location || 'TBA'}</span><IconArrowRight className="day-event__arrow" /></Link>) : <div className="day-empty"><IconCalendar /><strong>Nothing scheduled</strong><span>A perfect day to create something new.</span></div>}</aside>
    </section>
  </AppShell>
}
export default CalendarPage

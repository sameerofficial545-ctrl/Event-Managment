import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { parseApiError } from '../../api/client'
import AppShell from '../../components/AppShell'
import { useAuth } from '../../context/AuthContext'
import { IconArrowRight, IconCalendar, IconCheck, IconClock, IconMapPin } from '../../components/icons'
import './ProductPages.css'

const FILTERS = ['all', 'going', 'maybe', 'not_going']
function MyPlans() {
  const { user } = useAuth()
  const [items, setItems] = useState([]); const [filter, setFilter] = useState('all'); const [page, setPage] = useState(1); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  useEffect(() => { api.get('/events/').then(async ({ data }) => { const joined = await Promise.all(data.map(async (event) => { try { const response = await api.get(`/events/${event.id}/rsvps/`); const ownRsvp = response.data.find((r) => r.user === user?.username); return ownRsvp ? { event, rsvp: ownRsvp } : null } catch { return null } })); setItems(joined.filter(Boolean)) }).catch((e) => setError(parseApiError(e).message)).finally(() => setLoading(false)) }, [user?.username])
  const filtered = useMemo(() => items.filter((item) => filter === 'all' || item.rsvp.status === filter).sort((a,b) => new Date(a.event.start_time)-new Date(b.event.start_time)), [items, filter])
  const pages = Math.max(1, Math.ceil(filtered.length / 6)); const visible = filtered.slice((page-1)*6,page*6)
  const respond = async (item, status) => { const { data } = await api.post(`/events/${item.event.id}/rsvps/`, { status }); setItems((current) => current.map((entry) => entry.event.id === item.event.id ? { ...entry, rsvp: data } : entry)) }
  return <AppShell headerProps={{ eyebrow: 'Personal', title: 'My plans', showCta: false }}><section className="product-hero product-hero--plans"><div><span>Your RSVP hub</span><h2>All your plans. Zero chaos.</h2><p>Keep every event response organized and change your mind anytime.</p></div><IconCheck className="product-hero__icon" /></section>
    <div className="filter-rail">{FILTERS.map((value) => <button type="button" className={filter === value ? 'is-active' : ''} key={value} onClick={() => { setFilter(value); setPage(1) }}>{value === 'not_going' ? 'Can’t go' : value[0].toUpperCase()+value.slice(1)}<span>{value === 'all' ? items.length : items.filter((item) => item.rsvp.status === value).length}</span></button>)}</div>
    {error && <p className="product-error">{error}</p>}{loading ? <div className="plans-loading">Gathering your plans…</div> : visible.length ? <div className="plans-grid">{visible.map((item) => <article className="plan-card" key={item.event.id}><div className={`plan-card__status plan-card__status--${item.rsvp.status}`}>{item.rsvp.status === 'not_going' ? 'Can’t go' : item.rsvp.status}</div><h3>{item.event.title}</h3><p><IconCalendar />{new Date(item.event.start_time).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</p><p><IconClock />{new Date(item.event.start_time).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</p><p><IconMapPin />{item.event.location || 'Location TBA'}</p><div className="plan-card__actions"><select value={item.rsvp.status} onChange={(e) => respond(item,e.target.value)} aria-label={`Change RSVP for ${item.event.title}`}><option value="going">Going</option><option value="maybe">Maybe</option><option value="not_going">Can’t go</option></select><Link to={`/events?event=${item.event.id}`}>Details <IconArrowRight /></Link></div></article>)}</div> : <div className="product-empty"><IconCalendar /><h3>No plans here yet</h3><p>Explore events and RSVP to build your personal schedule.</p><Link to="/events">Discover events</Link></div>}
    {pages > 1 && <nav className="pagination" aria-label="Plans pages"><button disabled={page===1} onClick={() => setPage(page-1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page===pages} onClick={() => setPage(page+1)}>Next</button></nav>}
  </AppShell>
}
export default MyPlans

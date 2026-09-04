import FormField from '../../components/FormField'
import { IconX } from '../../components/icons'
import './Events.css'

const RANGE_OPTIONS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'all', label: 'All' },
]

export const DEFAULT_FILTERS = { range: 'upcoming', date: '', location: '', search: '' }

function isDefault(filters) {
  return (
    filters.range === DEFAULT_FILTERS.range &&
    filters.date === DEFAULT_FILTERS.date &&
    filters.location === DEFAULT_FILTERS.location &&
    filters.search === DEFAULT_FILTERS.search
  )
}

function EventFilters({ filters, onChange }) {
  const setFilter = (patch) => onChange({ ...filters, ...patch })

  return (
    <div className="event-filters">
      <div className="event-filters__chips" role="group" aria-label="Filter by time">
        {RANGE_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`event-filters__chip ${filters.range === key ? 'event-filters__chip--active' : ''}`}
            onClick={() => setFilter({ range: key })}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="event-filters__fields">
        <FormField
          label="Date"
          name="filter-date"
          type="date"
          value={filters.date}
          onChange={(e) => setFilter({ date: e.target.value })}
        />
        <FormField
          label="Location"
          name="filter-location"
          type="text"
          placeholder="Search by location..."
          value={filters.location}
          onChange={(e) => setFilter({ location: e.target.value })}
        />
      </div>

      {!isDefault(filters) && (
        <button
          type="button"
          className="event-filters__clear"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <IconX className="icon" />
          <span>Clear filters</span>
        </button>
      )}
    </div>
  )
}

export default EventFilters

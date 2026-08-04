import { useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { startOfDay, nextCheckIn, fmtClock, fmtDateTime } from '../utils/time'

export default function Dashboard({ onNavigate }) {
  const store = useStore()

  const todayObs = useMemo(
    () => store.observations.filter((o) => o.timestamp >= startOfDay()),
    [store.observations]
  )

  const mostCommon = useMemo(() => {
    const counts = {}
    store.observations.forEach((o) => {
      counts[o.eventId] = (counts[o.eventId] || 0) + 1
    })
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
    return topId ? store.tiles.find((t) => t.id === topId) : null
  }, [store.observations, store.tiles])

  const longestSince = useMemo(() => {
    if (!store.observations.length) return null
    const latest = Math.max(...store.observations.map((o) => o.timestamp))
    return Date.now() - latest
  }, [store.observations])

  const upcoming = nextCheckIn(store.settings.checkinTimes)
  const activeProject = store.projects.find((p) => p.id === store.settings.activeProjectId)

  return (
    <div>
      <h1 style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 600 }}>Today</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <StatCard label="Observations today" value={todayObs.length} />
        <StatCard label="Next check-in" value={upcoming || '—'} />
        <StatCard
          label="Most common event"
          value={mostCommon ? mostCommon.name : '—'}
          onClick={() => onNavigate('fmea')}
        />
        <StatCard
          label="Since last event"
          value={longestSince != null ? formatDuration(longestSince) : '—'}
        />
      </div>

      <div className="li-card" style={{ padding: 16, marginBottom: 10 }}>
        <div className="li-muted" style={{ fontSize: 12, marginBottom: 4 }}>
          Current project
        </div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{activeProject ? activeProject.name : 'None selected'}</div>
        <button
          onClick={() => onNavigate('projects')}
          style={{ fontSize: 13, color: 'var(--accent)', marginTop: 8 }}
        >
          Manage projects →
        </button>
      </div>

      <div className="li-card" style={{ padding: 16 }}>
        <div className="li-muted" style={{ fontSize: 12, marginBottom: 8 }}>
          Recent activity
        </div>
        {store.observations.length === 0 && (
          <p className="li-muted" style={{ fontSize: 13, margin: 0 }}>
            Nothing logged yet. Your next check-in will ask what happened.
          </p>
        )}
        {store.observations
          .slice()
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 6)
          .map((o) => {
            const tile = store.tiles.find((t) => t.id === o.eventId)
            return (
              <div
                key={o.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 0',
                  borderTop: '1px solid var(--border)'
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: tile?.color || 'var(--accent)' }} />
                <span style={{ fontSize: 13.5, flex: 1 }}>{tile?.name || 'Unknown event'}</span>
                <span className="li-muted li-mono" style={{ fontSize: 11.5 }}>
                  {fmtClock(o.timestamp)}
                </span>
              </div>
            )
          })}
      </div>
    </div>
  )
}

function StatCard({ label, value, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className="li-card" style={{ padding: 14, textAlign: 'left' }}>
      <div className="li-muted" style={{ fontSize: 11.5, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>{value}</div>
    </Tag>
  )
}

function formatDuration(ms) {
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return `${hrs}h ${rem}m`
}

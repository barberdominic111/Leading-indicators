import { useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { startOfDay, nextCheckIn, fmtClock } from '../utils/time'
import { IconX } from './icons'

export default function Dashboard({ onNavigate }) {
  const store = useStore()
  const lens = store.settings.activeProjectId
  const activeProject = store.projects.find((p) => p.id === lens)

  const scopedObs = useMemo(
    () => (lens ? store.observations.filter((o) => o.project === lens) : store.observations),
    [store.observations, lens]
  )

  const todayObs = useMemo(
    () => scopedObs.filter((o) => o.timestamp >= startOfDay()),
    [scopedObs]
  )

  const mostCommon = useMemo(() => {
    const counts = {}
    scopedObs.forEach((o) => {
      counts[o.eventId] = (counts[o.eventId] || 0) + 1
    })
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
    return topId ? store.tiles.find((t) => t.id === topId) : null
  }, [scopedObs, store.tiles])

  const longestSince = useMemo(() => {
    if (!scopedObs.length) return null
    const latest = Math.max(...scopedObs.map((o) => o.timestamp))
    return Date.now() - latest
  }, [scopedObs])

  const upcoming = nextCheckIn(store.settings.checkinTimes)

  const scopedCompletions = useMemo(
    () => (lens ? store.completions.filter((c) => c.project === lens) : store.completions),
    [store.completions, lens]
  )

  const todayCompletions = useMemo(() => {
    const start = startOfDay()
    const byType = {}
    scopedCompletions.forEach((c) => {
      if (c.timestamp < start) return
      byType[c.completionTypeId] = (byType[c.completionTypeId] || 0) + c.quantity
    })
    return Object.entries(byType)
      .map(([id, qty]) => ({ name: store.completionTypes.find((t) => t.id === id)?.name || 'Unknown', qty }))
      .sort((a, b) => b.qty - a.qty)
  }, [scopedCompletions, store.completionTypes])

  return (
    <div>
      <h1 style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 600 }}>
        {activeProject ? `Today · ${activeProject.name}` : 'Today'}
      </h1>

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
          Viewing
        </div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{activeProject ? activeProject.name : 'All projects'}</div>
        <p className="li-muted" style={{ fontSize: 11.5, margin: '4px 0 8px' }}>
          Every tab is scoped to this — change it from the bar at the top, or below.
        </p>
        <button
          onClick={() => onNavigate('projects')}
          style={{ fontSize: 13, color: 'var(--accent)' }}
        >
          Manage projects →
        </button>
      </div>

      {todayCompletions.length > 0 && (
        <div className="li-card" style={{ padding: 16, marginBottom: 10 }}>
          <div className="li-muted" style={{ fontSize: 12, marginBottom: 8 }}>
            Completed today
          </div>
          {todayCompletions.map((c) => (
            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '4px 0' }}>
              <span>{c.name}</span>
              <span className="li-mono" style={{ fontWeight: 600 }}>{c.qty}</span>
            </div>
          ))}
        </div>
      )}

      <div className="li-card" style={{ padding: 16 }}>
        <div className="li-muted" style={{ fontSize: 12, marginBottom: 8 }}>
          Recent activity
        </div>
        {scopedObs.length === 0 && (
          <p className="li-muted" style={{ fontSize: 13, margin: 0 }}>
            {lens ? 'Nothing logged for this project yet.' : 'Nothing logged yet. Your next check-in will ask what happened.'}
          </p>
        )}
        {scopedObs
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
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: tile?.color || 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, flex: 1 }}>{tile?.name || 'Unknown event'}</span>
                <span className="li-muted li-mono" style={{ fontSize: 11.5 }}>
                  {fmtClock(o.timestamp)}
                </span>
                <button
                  onClick={() => store.deleteObservation(o.id)}
                  aria-label={`Remove ${tile?.name || 'event'} entry`}
                  style={{ color: 'var(--text-muted)', padding: 2 }}
                >
                  <IconX width={13} height={13} />
                </button>
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

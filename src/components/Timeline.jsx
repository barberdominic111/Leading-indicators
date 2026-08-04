import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { startOfDay, endOfDay, fmtClock, fmtDate } from '../utils/time'

const ROW_H = 34
const PAD_L = 108
const PAD_R = 16

export default function Timeline() {
  const store = useStore()
  const [dateOffset, setDateOffset] = useState(0) // 0 = today, -1 = yesterday...
  const [projectFilter, setProjectFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const dayStart = startOfDay(Date.now() + dateOffset * 86400000)
  const dayEnd = endOfDay(Date.now() + dateOffset * 86400000)

  const { workdayStartMin, workdayEndMin } = store.settings.detectionConfig
  const rangeStart = dayStart + workdayStartMin * 60000
  const rangeEnd = dayStart + workdayEndMin * 60000
  const rangeMs = Math.max(rangeEnd - rangeStart, 1)

  const dayObs = useMemo(() => {
    let obs = store.observations.filter((o) => o.timestamp >= dayStart && o.timestamp <= dayEnd)
    if (projectFilter) obs = obs.filter((o) => o.project === projectFilter)
    return obs
  }, [store.observations, dayStart, dayEnd, projectFilter])

  const activeTiles = store.tiles.filter((t) => t.active !== false)
  const width = 340

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Timeline</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setDateOffset((d) => d - 1)} style={navBtn}>
            ‹
          </button>
          <div className="li-muted" style={{ fontSize: 12.5, minWidth: 82, textAlign: 'center', paddingTop: 8 }}>
            {dateOffset === 0 ? 'Today' : fmtDate(dayStart)}
          </div>
          <button onClick={() => setDateOffset((d) => Math.min(d + 1, 0))} disabled={dateOffset === 0} style={navBtn}>
            ›
          </button>
        </div>
      </div>

      {store.projects.length > 0 && (
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          style={{ marginBottom: 12, padding: '8px 10px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 13 }}
        >
          <option value="">All projects</option>
          {store.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      <div className="li-card" style={{ padding: 14 }}>
        <svg viewBox={`0 0 ${width} ${activeTiles.length * ROW_H + 30}`} width="100%">
          {/* hour gridlines */}
          {tickHours(workdayStartMin, workdayEndMin).map((mins) => {
            const x = PAD_L + ((mins - workdayStartMin) / (workdayEndMin - workdayStartMin)) * (width - PAD_L - PAD_R)
            return (
              <g key={mins}>
                <line x1={x} y1={4} x2={x} y2={activeTiles.length * ROW_H + 8} stroke="var(--border)" strokeWidth="1" />
                <text x={x} y={activeTiles.length * ROW_H + 22} fontSize="9" fill="var(--text-muted)" textAnchor="middle">
                  {Math.floor(mins / 60)}h
                </text>
              </g>
            )
          })}

          {activeTiles.map((tile, i) => {
            const y = i * ROW_H
            const points = dayObs.filter((o) => o.eventId === tile.id)
            return (
              <g key={tile.id}>
                <text x={0} y={y + ROW_H / 2 + 4} fontSize="10.5" fill="var(--text)">
                  {truncate(tile.name, 16)}
                </text>
                <line x1={PAD_L} y1={y + ROW_H / 2} x2={width - PAD_R} y2={y + ROW_H / 2} stroke="var(--border)" strokeWidth="1" />
                {points.map((o) => {
                  const clamped = Math.min(Math.max(o.timestamp, rangeStart), rangeEnd)
                  const x = PAD_L + ((clamped - rangeStart) / rangeMs) * (width - PAD_L - PAD_R)
                  return (
                    <circle
                      key={o.id}
                      cx={x}
                      cy={y + ROW_H / 2}
                      r={selected?.id === o.id ? 6 : 4.5}
                      fill={tile.color}
                      opacity={selected && selected.id !== o.id ? 0.45 : 1}
                      onClick={() => setSelected(o)}
                      style={{ cursor: 'pointer' }}
                    />
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      {selected && (
        <div className="li-card" style={{ padding: 14, marginTop: 10, fontSize: 13.5 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {store.tiles.find((t) => t.id === selected.eventId)?.name}
          </div>
          <div className="li-muted">Time: {fmtClock(selected.timestamp)}</div>
          {selected.project && <div className="li-muted">Project: {store.projects.find((p) => p.id === selected.project)?.name}</div>}
          {selected.customer && <div className="li-muted">Customer: {selected.customer}</div>}
          {selected.note && <div className="li-muted">Note: {selected.note}</div>}
          <button onClick={() => setSelected(null)} style={{ marginTop: 8, fontSize: 12.5, color: 'var(--accent)' }}>
            Close
          </button>
        </div>
      )}

      {dayObs.length === 0 && (
        <p className="li-muted" style={{ fontSize: 13, marginTop: 12 }}>
          No observations logged for this day yet.
        </p>
      )}
    </div>
  )
}

function tickHours(startMin, endMin) {
  const ticks = []
  const startHour = Math.ceil(startMin / 60)
  const endHour = Math.floor(endMin / 60)
  for (let h = startHour; h <= endHour; h++) ticks.push(h * 60)
  return ticks
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

const navBtn = {
  width: 30,
  height: 30,
  borderRadius: '50%',
  border: '1px solid var(--border)',
  color: 'var(--text-muted)'
}

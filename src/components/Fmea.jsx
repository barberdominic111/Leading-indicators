import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import ScaleCycler from './ScaleCycler.jsx'
import { sortFmeaRows } from '../utils/fmea'
import { IconRefresh } from './icons'

// Description font shrinks as it gets longer so a full 160-character note
// still fits the card without needing extra vertical space per row.
function descriptionSize(len) {
  if (len > 120) return 11.5
  if (len > 70) return 12.5
  return 13.5
}

export default function Fmea() {
  const store = useStore()
  const { scales } = store.settings

  // Row order is frozen until "Refresh RPN order" is tapped, so cycling a
  // Severity or Detection value on one card never causes another card to
  // jump underneath your next tap.
  const [order, setOrder] = useState(() => sortFmeaRows(store.fmeaRows).map((r) => r.tileId))

  const rowsById = useMemo(() => {
    const map = {}
    store.fmeaRows.forEach((r) => {
      map[r.tileId] = r
    })
    return map
  }, [store.fmeaRows])

  const orderedRows = useMemo(() => {
    const known = new Set(order)
    const newOnes = store.fmeaRows.filter((r) => !known.has(r.tileId)).map((r) => r.tileId)
    return [...order, ...newOnes].map((id) => rowsById[id]).filter(Boolean)
  }, [order, store.fmeaRows, rowsById])

  function refresh() {
    setOrder(sortFmeaRows(store.fmeaRows).map((r) => r.tileId))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>FMEA</h1>
        </div>
        <button
          onClick={refresh}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            color: 'var(--accent)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '7px 12px',
            whiteSpace: 'nowrap'
          }}
        >
          <IconRefresh width={14} height={14} />
          Refresh order
        </button>
      </div>
      <p className="li-muted" style={{ margin: '2px 0 14px', fontSize: 13 }}>
        Cards stay put while you work — tap Severity or Detection to cycle your configured scale, then refresh
        whenever you want the ranking by RPN updated.
      </p>

      {orderedRows.map((row) => (
        <div key={row.tileId} className="li-card" style={{ padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: row.description ? 4 : 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{row.failureMode}</span>
            <span className="li-muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>{row.category}</span>
          </div>

          {row.description && (
            <p
              className="li-muted"
              style={{ margin: '0 0 10px', fontSize: descriptionSize(row.description.length), lineHeight: 1.4 }}
            >
              {row.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: 16, fontSize: 12.5, marginBottom: 10 }}>
            <span className="li-muted">
              Occ <span className="li-mono" style={{ color: 'var(--text)', fontWeight: 600 }}>{row.occurrence}</span>
            </span>
            <span className="li-muted">
              RPN <span className="li-mono" style={{ color: 'var(--text)', fontWeight: 600 }}>{row.rpn ?? '—'}</span>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <ScaleCycler
              fullWidth
              fieldLabel="Severity"
              value={row.severity}
              scale={scales.severity}
              onChange={(v) => store.setSeverity(row.tileId, v)}
            />
            <ScaleCycler
              fullWidth
              fieldLabel="Detection"
              value={row.detection}
              scale={scales.detection}
              onChange={(v) => store.setDetection(row.tileId, v)}
            />
          </div>
        </div>
      ))}

      {orderedRows.length === 0 && (
        <p className="li-muted" style={{ fontSize: 13, textAlign: 'center', padding: 16 }}>
          No active events yet.
        </p>
      )}

      <p className="li-muted" style={{ fontSize: 12, marginTop: 4 }}>
        Detection starts from a suggested value based on when events tend to be noticed during the day, but every
        tap is yours to keep — it won't reset on its own.
      </p>
    </div>
  )
}

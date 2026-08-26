import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import ScaleCycler from './ScaleCycler.jsx'
import PolarityToggle from './PolarityToggle.jsx'
import { buildFmea, sortFmeaRows } from '../utils/fmea'
import { projectLabels } from '../utils/balance'
import { IconRefresh, IconCheck } from './icons'

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
  const lens = store.settings.activeProjectId
  const activeProject = store.projects.find((p) => p.id === lens)
  const labels = projectLabels(activeProject)

  // The central store.fmeaRows selector is intentionally unfiltered (it
  // backs the CSV export, a full backup). This screen instead builds its
  // own rows from whichever observations the current project lens allows,
  // so Occurrence and RPN reflect only the project you're viewing.
  const scopedObservations = useMemo(
    () => (lens ? store.observations.filter((o) => o.project === lens) : store.observations),
    [store.observations, lens]
  )
  const fmeaRows = useMemo(
    () =>
      buildFmea(
        store.tiles,
        scopedObservations,
        store.settings.severityByTile,
        store.settings.detectionByTile,
        store.settings.detectionConfig,
        store.settings.scales,
        store.settings.polarityByTile
      ),
    [
      store.tiles,
      scopedObservations,
      store.settings.severityByTile,
      store.settings.detectionByTile,
      store.settings.detectionConfig,
      store.settings.scales,
      store.settings.polarityByTile
    ]
  )

  // Row order is frozen until "Refresh RPN order" is tapped, so cycling a
  // Severity or Detection value on one card never causes another card to
  // jump underneath your next tap.
  const [order, setOrder] = useState(() => sortFmeaRows(fmeaRows).map((r) => r.tileId))
  const [justRefreshed, setJustRefreshed] = useState(false)

  const rowsById = useMemo(() => {
    const map = {}
    fmeaRows.forEach((r) => {
      map[r.tileId] = r
    })
    return map
  }, [fmeaRows])

  const orderedRows = useMemo(() => {
    const known = new Set(order)
    const newOnes = fmeaRows.filter((r) => !known.has(r.tileId)).map((r) => r.tileId)
    return [...order, ...newOnes].map((id) => rowsById[id]).filter(Boolean)
  }, [order, fmeaRows, rowsById])

  function refresh() {
    setOrder(sortFmeaRows(fmeaRows).map((r) => r.tileId))
    setJustRefreshed(true)
    setTimeout(() => setJustRefreshed(false), 1100)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{activeProject ? `FMEA · ${activeProject.name}` : 'FMEA'}</h1>
        </div>
        <button
          type="button"
          onClick={refresh}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            color: justRefreshed ? 'var(--success)' : 'var(--accent)',
            border: `1px solid ${justRefreshed ? 'var(--success)' : 'var(--border)'}`,
            borderRadius: 999,
            padding: '9px 14px',
            minHeight: 'var(--tap-min)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'color 0.15s ease, border-color 0.15s ease'
          }}
        >
          {justRefreshed ? <IconCheck width={14} height={14} /> : <IconRefresh width={14} height={14} />}
          {justRefreshed ? 'Updated' : 'Refresh order'}
        </button>
      </div>
      <p className="li-muted" style={{ margin: '2px 0 14px', fontSize: 13 }}>
        {activeProject
          ? `Occurrence and RPN below only count events logged under ${activeProject.name}.`
          : 'Occurrence and RPN below count events across all projects.'}{' '}
        Cards stay put while you work — tap Severity, Detection, or Polarity to cycle. Polarity marks whether a
        tile counts as positive or negative toward a project's balance{activeProject ? ` (using ${activeProject.name}'s labels)` : ''}; refresh whenever you want the ranking by RPN updated.
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
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
            <PolarityToggle
              value={store.settings.polarityByTile[row.tileId] ?? null}
              positiveLabel={labels.positive}
              negativeLabel={labels.negative}
              onChange={(v) => store.setPolarity(row.tileId, v)}
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

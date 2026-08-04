import { useStore } from '../store/StoreContext.jsx'
import ScaleCycler from './ScaleCycler.jsx'

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

  return (
    <div>
      <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>FMEA</h1>
      <p className="li-muted" style={{ margin: '0 0 14px', fontSize: 13 }}>
        Generated from your observations. Tap Severity or Detection to cycle through your configured scale — edit
        the scale itself in Settings.
      </p>

      {store.fmeaRows.map((row) => (
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

      {store.fmeaRows.length === 0 && (
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

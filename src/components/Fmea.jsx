import { useStore } from '../store/StoreContext.jsx'
import ScaleCycler from './ScaleCycler.jsx'

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

      <div className="li-card li-scroll" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              {['Failure mode', 'Category', 'Occ.', 'Severity', 'Detection', 'RPN'].map((h) => (
                <th key={h} className="li-muted" style={{ padding: '10px 12px', fontWeight: 500, fontSize: 11.5 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {store.fmeaRows.map((row) => (
              <tr key={row.tileId} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{row.failureMode}</td>
                <td style={{ padding: '10px 12px' }} className="li-muted">
                  {row.category}
                </td>
                <td style={{ padding: '10px 12px' }} className="li-mono">
                  {row.occurrence}
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <ScaleCycler
                    value={row.severity}
                    scale={scales.severity}
                    onChange={(v) => store.setSeverity(row.tileId, v)}
                  />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <ScaleCycler
                    value={row.detection}
                    scale={scales.detection}
                    onChange={(v) => store.setDetection(row.tileId, v)}
                  />
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }} className="li-mono">
                  {row.rpn ?? '—'}
                </td>
              </tr>
            ))}
            {store.fmeaRows.length === 0 && (
              <tr>
                <td colSpan={6} className="li-muted" style={{ padding: 16, textAlign: 'center' }}>
                  No active events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="li-muted" style={{ fontSize: 12, marginTop: 10 }}>
        Detection starts from a suggested value based on when events tend to be noticed during the day (later
        discovery suggests a worse score), but every tap is yours to keep — it won't reset on its own.
      </p>
    </div>
  )
}

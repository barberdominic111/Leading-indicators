import { useStore } from '../store/StoreContext.jsx'

export default function Fmea() {
  const store = useStore()

  return (
    <div>
      <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>FMEA</h1>
      <p className="li-muted" style={{ margin: '0 0 14px', fontSize: 13 }}>
        Generated from your observations. Set severity yourself — occurrence and detection are calculated.
      </p>

      <div className="li-card li-scroll" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
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
                <td style={{ padding: '10px 12px' }}>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={row.severity ?? ''}
                    placeholder="—"
                    onChange={(e) => {
                      const v = e.target.value === '' ? null : Number(e.target.value)
                      store.setSeverity(row.tileId, v)
                    }}
                    style={{
                      width: 44,
                      padding: '5px 6px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--surface-alt)',
                      fontSize: 13
                    }}
                  />
                </td>
                <td style={{ padding: '10px 12px' }} className="li-mono">
                  {row.detection}
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
        Detection is inferred from when events tend to be noticed during the day — later discovery scores worse
        (closer to 10), earlier discovery scores better (closer to 1). Adjust the workday window in Settings.
      </p>
    </div>
  )
}

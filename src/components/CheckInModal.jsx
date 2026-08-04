import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { IconCheck, IconX } from './icons'

export default function CheckInModal({ time, onDone }) {
  const store = useStore()
  const [selected, setSelected] = useState(new Set())
  const [note, setNote] = useState('')

  const activeTiles = store.tiles.filter((t) => t.active !== false)

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function submit() {
    if (selected.size) {
      store.addObservationsBatch(Array.from(selected), { note })
    }
    onDone()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 50
      }}
    >
      <div
        className="li-card li-scroll"
        style={{
          width: '100%',
          maxHeight: '85dvh',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          padding: 20,
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <div className="li-muted" style={{ fontSize: 12 }}>
              {time} check-in
            </div>
            <h2 style={{ margin: '2px 0 0', fontSize: 19, fontWeight: 600 }}>
              What have you completed since the last check-in?
            </h2>
          </div>
          <button onClick={onDone} aria-label="Dismiss" style={{ color: 'var(--text-muted)', padding: 6 }}>
            <IconX width={20} height={20} />
          </button>
        </div>

        <p className="li-muted" style={{ fontSize: 13, marginTop: 8 }}>
          Tap everything that happened. No judgment, no rush — this is just for the record.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            margin: '16px 0'
          }}
        >
          {activeTiles.map((tile) => {
            const isSel = selected.has(tile.id)
            return (
              <button
                key={tile.id}
                onClick={() => toggle(tile.id)}
                style={{
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 12px',
                  minHeight: 72,
                  textAlign: 'left',
                  border: `1.5px solid ${isSel ? tile.color : 'var(--border)'}`,
                  background: isSel ? `${tile.color}22` : 'var(--surface-alt)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.25 }}>{tile.name}</span>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: `1.5px solid ${isSel ? tile.color : 'var(--border)'}`,
                    background: isSel ? tile.color : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-contrast)'
                  }}
                >
                  {isSel && <IconCheck width={13} height={13} strokeWidth={2.4} />}
                </span>
              </button>
            )
          })}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note for this batch"
          rows={2}
          style={{
            width: '100%',
            resize: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 10,
            background: 'var(--surface-alt)',
            fontSize: 14,
            marginBottom: 14
          }}
        />

        <button
          onClick={submit}
          style={{
            width: '100%',
            background: 'var(--accent)',
            color: 'var(--accent-contrast)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 0',
            fontSize: 15,
            fontWeight: 600
          }}
        >
          {selected.size ? `Log ${selected.size} event${selected.size > 1 ? 's' : ''}` : 'Nothing to log — close'}
        </button>
      </div>
    </div>
  )
}

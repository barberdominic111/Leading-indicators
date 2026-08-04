import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { IconX, IconMinus } from './icons'

export default function CheckInModal({ time, onDone }) {
  const store = useStore()
  const [counts, setCounts] = useState({}) // { tileId: count }
  const [pulsing, setPulsing] = useState(null)
  const [note, setNote] = useState('')

  const activeTiles = store.tiles.filter((t) => t.active !== false)
  const totalTapped = Object.values(counts).reduce((s, c) => s + c, 0)

  function increment(id) {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
    setPulsing(id)
    setTimeout(() => setPulsing((cur) => (cur === id ? null : cur)), 420)
  }

  function decrement(id, e) {
    e.stopPropagation()
    setCounts((prev) => {
      const next = { ...prev }
      if (!next[id]) return prev
      next[id] -= 1
      if (next[id] <= 0) delete next[id]
      return next
    })
  }

  function submit() {
    if (totalTapped > 0) {
      store.addObservationsByCount(counts, { note })
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
          Tap a tile for each time it happened. No judgment, no rush — this is just for the record.
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
            const count = counts[tile.id] || 0
            const isSel = count > 0
            const isPulsing = pulsing === tile.id
            return (
              <button
                key={tile.id}
                onClick={() => increment(tile.id)}
                className={isPulsing ? 'li-tile-pulse li-tile-flash' : ''}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 12px',
                  minHeight: 76,
                  textAlign: 'left',
                  border: `1.5px solid ${isSel ? tile.color : 'var(--border)'}`,
                  background: isSel ? `${tile.color}1c` : 'var(--surface-alt)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  justifyContent: 'space-between',
                  transition: 'border-color 0.15s ease, background-color 0.15s ease',
                  '--flash-color': `${tile.color}40`
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.25, paddingRight: 22 }}>{tile.name}</span>

                {isSel && (
                  <button
                    onClick={(e) => decrement(tile.id, e)}
                    aria-label={`Reduce ${tile.name} count`}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconMinus width={11} height={11} />
                  </button>
                )}

                {isSel && (
                  <span
                    key={count}
                    className="li-counter-pop"
                    style={{
                      alignSelf: 'flex-end',
                      minWidth: 26,
                      height: 26,
                      padding: '0 7px',
                      borderRadius: 13,
                      background: tile.color,
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {count}
                  </span>
                )}
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
          {totalTapped ? `Log ${totalTapped} event${totalTapped > 1 ? 's' : ''}` : 'Nothing to log — close'}
        </button>
      </div>
    </div>
  )
}

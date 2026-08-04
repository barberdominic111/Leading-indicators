import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import TileEditor from './TileEditor.jsx'
import { IconPlus } from './icons'
import { startOfDay } from '../utils/time'

export default function Events() {
  const store = useStore()
  const [manage, setManage] = useState(false)
  const [editing, setEditing] = useState(null) // tile or 'new' or null
  const [pulsing, setPulsing] = useState(null) // tile id currently animating

  const tiles = manage ? store.tiles : store.tiles.filter((t) => t.active !== false)

  const todayCounts = useMemo(() => {
    const start = startOfDay()
    const counts = {}
    store.observations.forEach((o) => {
      if (o.timestamp >= start) counts[o.eventId] = (counts[o.eventId] || 0) + 1
    })
    return counts
  }, [store.observations])

  function logTile(id) {
    store.addObservation(id)
    setPulsing(id)
    setTimeout(() => setPulsing((cur) => (cur === id ? null : cur)), 420)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Events</h1>
          <p className="li-muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
            {manage ? 'Add, edit or retire event tiles.' : 'Tap a tile to log it right now.'}
          </p>
        </div>
        <button
          onClick={() => setManage((m) => !m)}
          style={{
            fontSize: 13,
            color: 'var(--accent)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '7px 14px'
          }}
        >
          {manage ? 'Done' : 'Manage'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {tiles.map((tile) => {
          const count = todayCounts[tile.id] || 0
          const isPulsing = pulsing === tile.id
          return (
            <button
              key={tile.id}
              onClick={() => (manage ? setEditing(tile) : logTile(tile.id))}
              className={`li-card${isPulsing ? ' li-tile-pulse li-tile-flash' : ''}`}
              style={{
                position: 'relative',
                padding: '18px 14px',
                minHeight: 84,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10,
                opacity: tile.active === false ? 0.45 : 1,
                borderLeft: `4px solid ${tile.color}`,
                '--flash-color': `${tile.color}33`
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.25 }}>{tile.name}</span>
              <span className="li-muted" style={{ fontSize: 11 }}>
                {tile.category || 'Uncategorized'}
              </span>

              {!manage && count > 0 && (
                <span
                  key={count}
                  className="li-counter-pop"
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    minWidth: 22,
                    height: 22,
                    padding: '0 6px',
                    borderRadius: 11,
                    background: tile.color,
                    color: '#fff',
                    fontSize: 11.5,
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

        {manage && (
          <button
            onClick={() => setEditing('new')}
            className="li-card"
            style={{
              padding: '18px 14px',
              minHeight: 84,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 6,
              color: 'var(--text-muted)',
              borderStyle: 'dashed'
            }}
          >
            <IconPlus width={20} height={20} />
            <span style={{ fontSize: 13 }}>Add event</span>
          </button>
        )}
      </div>

      {!manage && (
        <p className="li-muted" style={{ fontSize: 11.5, marginTop: 12 }}>
          The number on a tile is how many times you've logged it today.
        </p>
      )}

      {editing && (
        <TileEditor
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            if (editing === 'new') store.addTile(patch)
            else store.updateTile(editing.id, patch)
            setEditing(null)
          }}
          onDelete={(id) => {
            store.deleteTile(id)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

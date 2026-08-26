import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import TileEditor from './TileEditor.jsx'
import { IconPlus, IconChevronUp, IconChevronDown } from './icons'
import { startOfDay } from '../utils/time'
import { projectLabels, isBalanceOn } from '../utils/balance'

function lerp(min, max, t) {
  return min + (max - min) * t
}

// Maps the 0-100 slider to concrete pixel/font values for the tile grid.
function sizeStyle(size) {
  const t = size / 100
  return {
    padding: `${Math.round(lerp(10, 24, t))}px ${Math.round(lerp(10, 18, t))}px`,
    minHeight: Math.round(lerp(56, 128, t)),
    fontSize: Math.round(lerp(12, 17, t) * 10) / 10,
    categoryFontSize: Math.round(lerp(9.5, 12.5, t) * 10) / 10
  }
}

export default function Events() {
  const store = useStore()
  const [manage, setManage] = useState(false)
  const [editing, setEditing] = useState(null) // tile or 'new' or null
  const [pulsing, setPulsing] = useState(null) // tile id currently animating

  const tiles = manage ? store.tiles : store.tiles.filter((t) => t.active !== false)
  const tileSize = store.settings.tileSize ?? 50
  const dims = sizeStyle(tileSize)

  const activeProject = store.projects.find((p) => p.id === store.settings.activeProjectId)
  const balanceOn = isBalanceOn(activeProject)
  const labels = projectLabels(activeProject)
  const lens = store.settings.activeProjectId

  const [undo, setUndo] = useState(null) // { obsId, tileName }

  const todayCounts = useMemo(() => {
    const start = startOfDay()
    const counts = {}
    store.observations.forEach((o) => {
      if (o.timestamp < start) return
      if (lens && o.project !== lens) return
      counts[o.eventId] = (counts[o.eventId] || 0) + 1
    })
    return counts
  }, [store.observations, lens])

  function logTile(id, name) {
    const obsId = store.addObservation(id)
    setPulsing(id)
    setTimeout(() => setPulsing((cur) => (cur === id ? null : cur)), 420)
    setUndo({ obsId, tileName: name })
    setTimeout(() => setUndo((cur) => (cur?.obsId === obsId ? null : cur)), 5000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Events</h1>
          <p className="li-muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
            {manage ? 'Add, edit, reorder or retire event tiles.' : 'Tap a tile to log it right now.'}
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

      <div className="li-card" style={{ padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="li-muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
          Tile size
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={tileSize}
          onChange={(e) => store.updateSettings({ tileSize: Number(e.target.value) })}
          className="li-slider"
        />
        <span className="li-muted li-mono" style={{ fontSize: 11.5, width: 26, textAlign: 'right' }}>
          {tileSize}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {tiles.map((tile, idx) => {
          const count = todayCounts[tile.id] || 0
          const isPulsing = pulsing === tile.id

          if (manage) {
            return (
              <div
                key={tile.id}
                className="li-card"
                style={{
                  position: 'relative',
                  padding: dims.padding,
                  minHeight: dims.minHeight,
                  display: 'flex',
                  gap: 8,
                  opacity: tile.active === false ? 0.45 : 1,
                  borderLeft: `4px solid ${tile.color}`
                }}
              >
                <button
                  onClick={() => setEditing(tile)}
                  style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6 }}
                >
                  <span style={{ fontSize: dims.fontSize, fontWeight: 500, lineHeight: 1.25 }}>{tile.name}</span>
                  <span className="li-muted" style={{ fontSize: dims.categoryFontSize }}>
                    {tile.category || 'Uncategorized'}
                  </span>
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button
                    onClick={() => store.moveTile(tile.id, -1)}
                    disabled={idx === 0}
                    aria-label={`Move ${tile.name} up`}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      color: idx === 0 ? 'var(--border)' : 'var(--text-muted)'
                    }}
                  >
                    <IconChevronUp width={14} height={14} />
                  </button>
                  <button
                    onClick={() => store.moveTile(tile.id, 1)}
                    disabled={idx === tiles.length - 1}
                    aria-label={`Move ${tile.name} down`}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      color: idx === tiles.length - 1 ? 'var(--border)' : 'var(--text-muted)'
                    }}
                  >
                    <IconChevronDown width={14} height={14} />
                  </button>
                </div>
              </div>
            )
          }

          const polarity = store.settings.polarityByTile[tile.id] ?? null
          const showPolarity = balanceOn && polarity
          const polarityColor = polarity === 'positive' ? 'var(--success)' : polarity === 'negative' ? 'var(--danger)' : null
          const polarityText = polarity === 'positive' ? labels.positive : polarity === 'negative' ? labels.negative : null

          return (
            <button
              key={tile.id}
              onClick={() => logTile(tile.id, tile.name)}
              className={`li-card${isPulsing ? ' li-tile-pulse li-tile-flash' : ''}`}
              style={{
                position: 'relative',
                padding: dims.padding,
                minHeight: dims.minHeight,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10,
                borderLeft: `4px solid ${showPolarity ? polarityColor : tile.color}`,
                '--flash-color': `${tile.color}33`
              }}
            >
              <span style={{ fontSize: dims.fontSize, fontWeight: 500, lineHeight: 1.25 }}>{tile.name}</span>
              <span className="li-muted" style={{ fontSize: dims.categoryFontSize }}>
                {tile.category || 'Uncategorized'}
              </span>
              {showPolarity && (
                <span style={{ fontSize: dims.categoryFontSize, fontWeight: 600, color: polarityColor }}>
                  {polarityText} {polarity === 'positive' ? '+' : '−'}
                </span>
              )}

              {count > 0 && (
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
              padding: dims.padding,
              minHeight: dims.minHeight,
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

      {undo && (
        <div
          className="li-card"
          style={{
            position: 'fixed',
            left: 16,
            right: 16,
            bottom: 'calc(72px + env(safe-area-inset-bottom))',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            zIndex: 40,
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
          }}
        >
          <span style={{ fontSize: 13.5 }}>Logged "{undo.tileName}"</span>
          <button
            onClick={() => {
              store.deleteObservation(undo.obsId)
              setUndo(null)
            }}
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}
          >
            Undo
          </button>
        </div>
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

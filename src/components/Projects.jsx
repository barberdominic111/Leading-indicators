import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { IconPlus, IconX, IconCheck } from './icons'

export default function Projects() {
  const store = useStore()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  function add() {
    if (!name.trim()) return
    store.addProject(name.trim())
    setName('')
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>Projects</h1>
      <p className="li-muted" style={{ margin: '0 0 14px', fontSize: 13 }}>
        Tag observations to a project, then filter Timeline, FMEA and Charts by it.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="New project name"
          style={{ flex: 1, padding: '11px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-alt)', fontSize: 14 }}
        />
        <button onClick={add} style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', borderRadius: 'var(--radius-sm)', padding: '0 16px' }}>
          <IconPlus width={18} height={18} />
        </button>
      </div>

      <div
        onClick={() => store.updateSettings({ activeProjectId: null })}
        className="li-card"
        style={{
          padding: 14,
          marginBottom: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          border: `1.5px solid ${!store.settings.activeProjectId ? 'var(--accent)' : 'var(--border)'}`
        }}
      >
        <span style={{ fontSize: 14 }}>No active project</span>
        {!store.settings.activeProjectId && <IconCheck width={17} height={17} color="var(--accent)" />}
      </div>

      {store.projects.map((p) => {
        const isActive = store.settings.activeProjectId === p.id
        const count = store.observations.filter((o) => o.project === p.id).length
        const isEditing = editingId === p.id
        return (
          <div
            key={p.id}
            className="li-card"
            style={{
              padding: 14,
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`
            }}
          >
            {isEditing ? (
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    store.updateProject(p.id, { name: editingName.trim() || p.name })
                    setEditingId(null)
                  }
                }}
                style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 14 }}
              />
            ) : (
              <button onClick={() => store.updateSettings({ activeProjectId: p.id })} style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                <div className="li-muted" style={{ fontSize: 11.5 }}>
                  {count} observation{count === 1 ? '' : 's'}
                </div>
              </button>
            )}

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {isActive && !isEditing && <IconCheck width={17} height={17} color="var(--accent)" />}
              {!isEditing && (
                <button
                  onClick={() => {
                    setEditingId(p.id)
                    setEditingName(p.name)
                  }}
                  className="li-muted"
                  style={{ fontSize: 12.5 }}
                >
                  Edit
                </button>
              )}
              <button onClick={() => store.deleteProject(p.id)} style={{ color: 'var(--danger)', padding: 4 }}>
                <IconX width={16} height={16} />
              </button>
            </div>
          </div>
        )
      })}

      {store.projects.length === 0 && (
        <p className="li-muted" style={{ fontSize: 13 }}>
          No projects yet — add one above, or leave observations unassigned.
        </p>
      )}
    </div>
  )
}

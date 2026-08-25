import { useState, useRef } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { IconPlus, IconX, IconCheck, IconImport } from './icons'
import ProjectBalanceEditor from './ProjectBalanceEditor.jsx'

export default function Projects() {
  const store = useStore()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [importing, setImporting] = useState(false)
  const [importText, setImportText] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const fileInputRef = useRef(null)

  function add() {
    if (!name.trim()) return
    store.addProject(name.trim())
    setName('')
  }

  function parseImportNames(text) {
    // Accepts one project per line, and/or comma-separated on a line —
    // covers a plain list, a single CSV column, or a comma-separated row.
    return text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  function runImport() {
    const names = parseImportNames(importText)
    if (names.length) store.importProjects(names)
    setImportText('')
    setImporting(false)
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImportText((prev) => (prev ? `${prev}\n${reader.result}` : String(reader.result)))
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Projects</h1>
          <p className="li-muted" style={{ margin: '2px 0 14px', fontSize: 13 }}>
            Tag observations to a project, then filter Timeline, FMEA and Charts by it.
          </p>
        </div>
        <button
          onClick={() => setImporting((v) => !v)}
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
          <IconImport width={14} height={14} />
          Import
        </button>
      </div>

      {importing && (
        <div className="li-card" style={{ padding: 14, marginBottom: 16 }}>
          <p className="li-muted" style={{ fontSize: 12.5, margin: '0 0 8px' }}>
            Paste project names — one per line, or comma-separated — or import a .txt/.csv file. Duplicates of
            projects you already have are skipped automatically.
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={'Project A\nProject B\nProject C'}
            rows={4}
            style={{
              width: '100%',
              resize: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: 10,
              background: 'var(--surface-alt)',
              fontSize: 13.5,
              marginBottom: 10
            }}
          />
          <input ref={fileInputRef} type="file" accept=".txt,.csv" onChange={handleFile} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1, fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 0' }}
            >
              Choose file
            </button>
            <button
              onClick={runImport}
              disabled={!importText.trim()}
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 600,
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 0',
                opacity: importText.trim() ? 1 : 0.5
              }}
            >
              Add all
            </button>
          </div>
        </div>
      )}

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
        const isExpanded = expandedId === p.id
        const balanceMode = p.balanceMode || 'off'
        return (
          <div
            key={p.id}
            className="li-card"
            style={{
              padding: 14,
              marginBottom: 8,
              border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

            {!isEditing && (
              <button
                onClick={() => setExpandedId(isExpanded ? null : p.id)}
                style={{
                  marginTop: 10,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: balanceMode !== 'off' ? 'var(--accent)' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  padding: '5px 12px'
                }}
              >
                Balance: {balanceMode === 'off' ? 'Off' : balanceMode === 'solo' ? 'Solo' : 'Dyad'} {isExpanded ? '▴' : '▾'}
              </button>
            )}

            {isExpanded && !isEditing && <ProjectBalanceEditor project={p} onUpdate={(patch) => store.updateProject(p.id, patch)} />}
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

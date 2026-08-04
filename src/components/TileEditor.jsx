import { useState } from 'react'
import { IconX } from './icons'

const SWATCHES = ['#AD5B45', '#B5764B', '#B98A2E', '#6B8F71', '#4C6B8A', '#8A7A9B', '#7A8CA3', '#9C9892']
const DESCRIPTION_MAX = 160

export default function TileEditor({ initial, onSave, onDelete, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [category, setCategory] = useState(initial?.category || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [color, setColor] = useState(initial?.color || SWATCHES[0])
  const [active, setActive] = useState(initial?.active !== false)

  function submit() {
    if (!name.trim()) return
    onSave({ name: name.trim(), category: category.trim(), description: description.trim(), color, active })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}
    >
      <div className="li-card" style={{ width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{initial ? 'Edit event' : 'New event'}</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 6 }}>
            <IconX width={20} height={20} />
          </button>
        </div>

        <label style={labelStyle}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Customer complaint" style={inputStyle} />

        <label style={labelStyle}>Category</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Quality" style={inputStyle} />

        <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
          <span>Description (optional)</span>
          <span>{description.length}/{DESCRIPTION_MAX}</span>
        </label>
        <textarea
          value={description}
          maxLength={DESCRIPTION_MAX}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Context shown on the FMEA card"
          rows={3}
          style={{ ...inputStyle, resize: 'none' }}
        />

        <label style={labelStyle}>Color</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={c}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: c,
                border: color === c ? '3px solid var(--text)' : '1px solid var(--border)'
              }}
            />
          ))}
        </div>

        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active (shows on the log grid)
        </label>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          {initial && (
            <button
              onClick={() => onDelete(initial.id)}
              style={{ flex: 1, padding: '13px 0', borderRadius: 'var(--radius-md)', color: 'var(--danger)', border: '1px solid var(--border)' }}
            >
              Delete
            </button>
          )}
          <button
            onClick={submit}
            style={{ flex: 2, padding: '13px 0', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: 'var(--accent-contrast)', fontWeight: 600 }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, marginTop: 12 }
const inputStyle = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  background: 'var(--surface-alt)',
  fontSize: 14
}

import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useTheme } from '../theme/ThemeContext.jsx'
import { IconX, IconPlus } from './icons'

export default function Settings() {
  const store = useStore()
  const { themeKey, setThemeKey, themes } = useTheme()
  const [newTime, setNewTime] = useState('09:00')

  const { checkinTimes } = store.settings

  function addTime() {
    if (checkinTimes.includes(newTime)) return
    store.updateSettings({ checkinTimes: [...checkinTimes, newTime].sort() })
  }

  function removeTime(t) {
    store.updateSettings({ checkinTimes: checkinTimes.filter((x) => x !== t) })
  }

  function resetAllData() {
    if (confirm('This clears every tile, project, and observation on this device. Continue?')) {
      localStorage.removeItem('li_app_data_v1')
      window.location.reload()
    }
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 14px', fontSize: 20, fontWeight: 600 }}>Settings</h1>

      <Section title="Theme">
        <div style={{ display: 'flex', gap: 8 }}>
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => setThemeKey(t.key)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${themeKey === t.key ? 'var(--accent)' : 'var(--border)'}`,
                color: themeKey === t.key ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 13
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Check-in schedule">
        <p className="li-muted" style={{ fontSize: 12.5, marginTop: -4, marginBottom: 10 }}>
          You'll be prompted at each of these times to log what happened since the last one.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {checkinTimes.map((t) => (
            <span
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 6px 6px 12px',
                borderRadius: 999,
                background: 'var(--surface-alt)',
                fontSize: 13
              }}
              className="li-mono"
            >
              {t}
              <button onClick={() => removeTime(t)} style={{ color: 'var(--text-muted)' }}>
                <IconX width={13} height={13} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            style={{ flex: 1, padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-alt)' }}
          />
          <button onClick={addTime} style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', borderRadius: 'var(--radius-sm)', padding: '0 16px' }}>
            <IconPlus width={17} height={17} />
          </button>
        </div>
      </Section>

      <ScaleSection title="Severity scale" category="severity" />
      <ScaleSection title="Detection scale" category="detection" />

      <CompletionTypesSection />

      <Section title="Data">
        <p className="li-muted" style={{ fontSize: 12.5, marginTop: -4, marginBottom: 10 }}>
          Everything stays on this device — no account, no cloud, no analytics.
        </p>
        <button onClick={resetAllData} style={{ color: 'var(--danger)', fontSize: 13.5, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
          Clear all data
        </button>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="li-card" style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}

function CompletionTypesSection() {
  const store = useStore()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  function add() {
    if (!name.trim()) return
    store.addCompletionType(name)
    setName('')
  }

  return (
    <Section title="Check-in completions">
      <p className="li-muted" style={{ fontSize: 12.5, marginTop: -4, marginBottom: 10 }}>
        At each check-in, alongside logging events, you're asked what finished work you completed since the last
        one — separate from how many tiles you tapped. Define the things worth counting here, or add new ones
        right at check-in.
      </p>

      {store.completionTypes.map((c) => {
        const isEditing = editingId === c.id
        return (
          <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            {isEditing ? (
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    store.updateCompletionType(c.id, { name: editingName.trim() || c.name })
                    setEditingId(null)
                  }
                }}
                onBlur={() => {
                  store.updateCompletionType(c.id, { name: editingName.trim() || c.name })
                  setEditingId(null)
                }}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
              />
            ) : (
              <button
                onClick={() => {
                  setEditingId(c.id)
                  setEditingName(c.name)
                }}
                style={{ flex: 1, textAlign: 'left', padding: '8px 10px', borderRadius: 8, background: 'var(--surface-alt)', fontSize: 13 }}
              >
                {c.name}
              </button>
            )}
            <button onClick={() => store.deleteCompletionType(c.id)} style={{ color: 'var(--danger)', padding: 4 }}>
              <IconX width={15} height={15} />
            </button>
          </div>
        )
      })}

      {store.completionTypes.length === 0 && (
        <p className="li-muted" style={{ fontSize: 12.5, marginBottom: 10 }}>
          Nothing defined yet — try something like "Finished goods" or "Quotes closed."
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="e.g. Finished goods"
          style={{ flex: 1, padding: '9px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-alt)', fontSize: 13 }}
        />
        <button onClick={add} style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', borderRadius: 8, padding: '0 16px' }}>
          <IconPlus width={16} height={16} />
        </button>
      </div>
    </Section>
  )
}

function ScaleSection({ title, category }) {
  const store = useStore()
  const scale = store.settings.scales[category]
  const sorted = [...scale].sort((a, b) => a.value - b.value)

  function updateEntry(idx, patch) {
    const next = scale.map((e, i) => (i === idx ? { ...e, ...patch } : e))
    store.updateScales(category, next)
  }

  function removeEntry(idx) {
    store.updateScales(
      category,
      scale.filter((_, i) => i !== idx)
    )
  }

  function addEntry() {
    const maxValue = scale.reduce((m, e) => Math.max(m, e.value), 0)
    store.updateScales(category, [...scale, { value: Math.min(maxValue + 1, 10), label: '' }])
  }

  return (
    <Section title={title}>
      <p className="li-muted" style={{ fontSize: 12.5, marginTop: -4, marginBottom: 10 }}>
        Add as many number/word thresholds as you want. Tapping the value on the FMEA screen cycles through these,
        in ascending order, and shows the matching word.
      </p>

      {scale.map((entry, idx) => {
        const trueIdx = idx
        return (
          <div key={trueIdx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <input
              type="number"
              min={1}
              max={10}
              value={entry.value}
              onChange={(e) => updateEntry(trueIdx, { value: Number(e.target.value) })}
              style={{ width: 52, padding: '8px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-alt)', fontSize: 13 }}
            />
            <input
              type="text"
              value={entry.label}
              placeholder="Word for this value"
              onChange={(e) => updateEntry(trueIdx, { label: e.target.value })}
              style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-alt)', fontSize: 13 }}
            />
            <button onClick={() => removeEntry(trueIdx)} style={{ color: 'var(--danger)', padding: 4 }}>
              <IconX width={15} height={15} />
            </button>
          </div>
        )
      })}

      <button
        onClick={addEntry}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12.5,
          color: 'var(--accent)',
          border: '1px dashed var(--border)',
          borderRadius: 8,
          padding: '8px 12px',
          marginTop: 4
        }}
      >
        <IconPlus width={14} height={14} />
        Add threshold
      </button>

      {sorted.length > 0 && (
        <p className="li-muted li-mono" style={{ fontSize: 11, marginTop: 10 }}>
          Cycle order: {sorted.map((e) => `${e.value}${e.label ? ` (${e.label})` : ''}`).join(' → ')}
        </p>
      )}
    </Section>
  )
}

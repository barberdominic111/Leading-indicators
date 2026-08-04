import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useTheme } from '../theme/ThemeContext.jsx'
import { IconX, IconPlus } from './icons'

export default function Settings() {
  const store = useStore()
  const { themeKey, setThemeKey, themes } = useTheme()
  const [newTime, setNewTime] = useState('09:00')

  const { checkinTimes, detectionConfig } = store.settings

  function addTime() {
    if (checkinTimes.includes(newTime)) return
    store.updateSettings({ checkinTimes: [...checkinTimes, newTime].sort() })
  }

  function removeTime(t) {
    store.updateSettings({ checkinTimes: checkinTimes.filter((x) => x !== t) })
  }

  function updateWorkday(key, hours) {
    store.updateSettings({
      detectionConfig: { ...detectionConfig, [key]: hours * 60 }
    })
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

      <Section title="Detection window">
        <p className="li-muted" style={{ fontSize: 12.5, marginTop: -4, marginBottom: 10 }}>
          Used to score FMEA detection and to bound the Timeline axis. Events near the start score better;
          events near the end score worse.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 13 }} className="li-muted">
            Start
            <input
              type="number"
              min={0}
              max={23}
              value={detectionConfig.workdayStartMin / 60}
              onChange={(e) => updateWorkday('workdayStartMin', Number(e.target.value))}
              style={{ width: 52, marginLeft: 8, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)' }}
            />
            h
          </label>
          <label style={{ fontSize: 13 }} className="li-muted">
            End
            <input
              type="number"
              min={1}
              max={24}
              value={detectionConfig.workdayEndMin / 60}
              onChange={(e) => updateWorkday('workdayEndMin', Number(e.target.value))}
              style={{ width: 52, marginLeft: 8, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)' }}
            />
            h
          </label>
        </div>
      </Section>

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

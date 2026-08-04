import { IconHome, IconGrid, IconTimeline, IconTriangle, IconChart, IconFolder, IconSettings } from './icons'

const TABS = [
  { key: 'dashboard', label: 'Dashboard', Icon: IconHome },
  { key: 'events', label: 'Events', Icon: IconGrid },
  { key: 'timeline', label: 'Timeline', Icon: IconTimeline },
  { key: 'fmea', label: 'FMEA', Icon: IconTriangle },
  { key: 'charts', label: 'Charts', Icon: IconChart },
  { key: 'projects', label: 'Projects', Icon: IconFolder },
  { key: 'settings', label: 'Settings', Icon: IconSettings }
]

export default function Nav({ active, onChange }) {
  return (
    <nav
      style={{
        display: 'flex',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        flexShrink: 0
      }}
    >
      {TABS.map(({ key, label, Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-current={isActive}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 2px 10px',
              minHeight: 'var(--tap-min)',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color 0.15s ease'
            }}
          >
            <Icon width={20} height={20} />
            <span style={{ fontSize: 11, letterSpacing: 0.2 }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

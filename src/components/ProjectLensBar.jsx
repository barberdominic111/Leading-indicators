import { useStore } from '../store/StoreContext.jsx'
import { IconFolder } from './icons'

// A single, always-visible control that sets which project every screen
// is viewed through. This replaces the old per-screen project dropdowns
// on Timeline and Charts — there is now exactly one place to change the
// lens, and it applies everywhere at once, including which project new
// observations get tagged with when you log an event.
export default function ProjectLensBar() {
  const store = useStore()
  const lens = store.settings.activeProjectId || ''

  if (store.projects.length === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-alt)',
        flexShrink: 0
      }}
    >
      <IconFolder width={15} height={15} color="var(--text-muted)" />
      <span className="li-muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        Viewing
      </span>
      <select
        value={lens}
        onChange={(e) => store.updateSettings({ activeProjectId: e.target.value || null })}
        style={{
          flex: 1,
          padding: '6px 8px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          fontSize: 13,
          color: 'var(--text)'
        }}
      >
        <option value="">All projects</option>
        {store.projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}
